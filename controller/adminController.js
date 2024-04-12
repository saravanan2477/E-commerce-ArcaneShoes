const express = require("express");
const adminCollections = require("../model/admin");
const UserCollection=require("../model/users")
const Category = require("../model/category");
const Ordercollection = require("../model/order")

//adminlogin get
const adminlogin = async (req, res) => {
    try {
        if(req.session.admin){
                res.redirect("/admin/dashboard")
        }
        else{
        res.render("adminlogin");
        }
    } catch (error) {
        console.log("Error:", error);
        res.status(500).send("Internal Server Error");
    }
}


//adminlogin post
const adminloginpost = async (req, res) => {
    console.log("hejefnb");
    try {
        const admin = {
            username: "admin",
            password: "1234"
        }

        if (req.body.username === admin.username && req.body.password === admin.password) {
            req.session.admin = admin.username;
            res.redirect("/admin/dashboard");
        } else {
           res.redirect('/admin/adminlogin/?message=InvalidEntry')
            res.render('adminlogin');
        }
    } catch (error) {
        console.log("Error:", error);
        res.status(500).send("Internal Server Error");
    }
};


//dashboard get
const dashboard = async (req, res) => {
    try {
      
       res.render('dashboard');

       
      
    } catch (error) {
        console.log("Error:", error);
        res.status(500).send("Internal Server Error");
    }
}

//!usermanagement get
const usermanagement = async (req, res) => {
    try {
       const userdata=await UserCollection.find();
       console.log("userdata",userdata);
        res.render('usermanagement',{userdata});
    } catch (error) {
        console.log("Error:", error);
        res.status(500).send("Internal Server Error");
    }
}


//!usermanagement post  
const usermanagementpost=async(req,res)=>{
    try{
        const data={
            username: req.body.username,
            email: req.body.Email,
            password: hashedPassword,
            isblocked:true,
        }
        await UserCollection.insertMany([data])
        .then(()=>{
            console.log("inserted sucessful");
            res.redirect('/admin/usermanagement')
        }).catch((err)=>{
            console.log("inserted failed",err);
        })
        res.redirect("/admin/usermanagement")
    }

    catch (error) {
        console.log("Error:", error);
        res.status(500).send("Internal Server Error");
    }
}


//admin can block the user
const block = async (req, res) => {
    try {
      const userId = req.params.id; 
      console.log("user", userId);
  
      const user = await UserCollection.findById(userId);
  
      if (!user) {
        console.log("User not found");
        return res.status(404).send("User not found.");
      }
  
      user.isblocked = !user.isblocked;
      await user.save(); // Change User.save() to user.save()
  
      console.log("Blocked/Unblocked");
      res.redirect("/admin/usermanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to block/unblock user.");
    }
  };
  
  // adminController.unblock
  const unblock = async (req, res) => {
    try {
      const userId = req.params.id;
      console.log("user", userId);
  
      const user = await UserCollection.findById(userId);
  
      if (!user) {
        console.log("User not found");
        return res.status(404).send("User not found.");
      }
  
      user.isblocked = false;
      await user.save();
  
      console.log("Unblocked");
      res.redirect("/admin/usermanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to unblock user.");
    }
  };








//!categorymanagement get
const categorymanagement = async (req, res) => {
  try {
      let sortField = req.query.sort || 'category'; // Default sorting by category name
      const categories = await Category.find().sort(sortField);
      console.log("categories", categories);
      res.render('categorymanagement', { categories });
  } catch (error) {
      console.log("Error:", error);
      res.status(500).send("Internal Server Error");
  }
}



 
//!add category page get
const addCategoryGet = async(req,res)=>{
    try{ 
        res.render("addcategory");    
    }
    catch(error){
        console.log("error",error);
        res.status(500).send("internal server error");
    }
}


//!category management  add post

const addCategoryPost= async (req, res) => {
    console.log("reached post category")
    const name = req.body.name;  
    console.log(name);
    const newCategory = await Category.findOne({
        category: { $regex: new RegExp("^" + name + "$", "i") },
      });
    if (newCategory === null) {
      try {
        console.log("worked");
        const newCategory = new Category({
            category: name,
        });
        newCategory.save();
      } catch (err) {
        console.error(err);
        return res.status(500).send("Error inserting category");
      }
      res.redirect("/admin/categorymanagement");
    } else {
      res.render("addcategory", { message: "Category already exist!" });
    }
  }

//! Controller function to edit a category

     const editCategoryget = async (req, res) => {
    try {
      const id = req.params.id;
      const category = await Category.findOne({ _id: id });
      res.render("editcategory", { category: category });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to display the category edit page.");
    }
  }


  

  const editCategorypost = async (req, res) => {
    const id = req.params.id;
    const categoryname = req.body.categoryname;
    console.log(`this is the id ${id} and this is the categoryname ${categoryname}`);

    // Fetch the category details from the database
    const category = await Category.findById(id);

    // Check if there's already a category with the new name
    const existingCategory = await Category.findOne({
        category: { $regex: new RegExp("^" + categoryname + "$", "i") },
        _id: { $ne: id } // Ensure the category being checked is not the one being edited
    });

    if (existingCategory) {
        // If a category with the new name exists, render the same page with an error message
        return res.render('editcategory', { message: "Category already exists!", category: category });
    }

    try {
        await Category.updateOne(
            { _id: id },
            { $set: { category: categoryname } }
        );
    } catch (err) {
        console.error(err);
        return res.status(500).send("Failed to edit category.");
    }
    // Assuming you have a success message or redirect logic here
    res.redirect("/admin/categorymanagement");
}




//!category page list and unlist
// Function to list a category  getBlockUser: async (req, res) => {
  const UnList = async (req, res) => {    
    try {
      console.log("reached toggler");
  
      // Find the category by ID
      const category = await Category.findOne({ _id: req.params.id });
  
      if (!category) {
       // return res.status(404).send("Category not found.");
      }
  
      // Update the 'block' field to its opposite value
      category.islisted = !category.islisted;
  
      // Save the updated category
      await category.save();
  
      console.log("Updated category:", category);
  
      res.redirect("/admin/categorymanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to toggle category block status.");
    }
  }
  







//!product management get
const productmanagement= async(req,res)=>{
    try{
        res.render("productmanagement");
    }catch(error){
        console.log("error",error);
        res.status(500).send("internal server error");
    }
}


const getLogout = (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.log("Error distroying session: ", err);
        } else {
          res.redirect("/admin/adminlogin");
        }
      });
    } catch (err) {
      console.error("Error in getLogout:", err);
      res.status(500).send("Error occurred during logout. Please try again.");
    }
  }




const orderget = async(req,res)=>{
  try{
  const orderdetalist = await Ordercollection.find().sort({ orderDate: -1 });

    res.render("orderManagement",{orderdetalist});
  }
  catch(err){
    console.log("error");
  return res.status(500).send("Failed to order page.");

  }
}

const updateUserOrder = async (req, res) => {
  const orderid = req.params.productid;
  const productid = req.params.orderid;
  const newstatus = req.body.status;
  try {
    const order = await Ordercollection.findOneAndUpdate(
      { _id: orderid, 'productcollection._id': productid },
      { $set: { 'productcollection.$.status': newstatus } },
      { new: true }
  );

    if (!order) {
        return res.status(404).send("Order or product not found");
    }

    console.log("Updated Product Collection for Order ID:", order._id);
        console.log(orderget.productcollection);
        console.log("-----------------------------");
        if (newstatus === 'Delivered') {
          // Update the database to track that the order has been delivered
          await Ordercollection.findOneAndUpdate(
              { _id: orderid },
              { $set: { 'delivered': true } }
          );
      }
        res.redirect('/adminOrder');
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
 };





module.exports = {
    adminlogin,
    adminloginpost,
    dashboard,
    usermanagement,
    usermanagementpost,
    block,
    unblock,

    categorymanagement,
    
    UnList,
    addCategoryPost,addCategoryGet,editCategoryget,editCategorypost,
    getLogout,
    productmanagement,

    orderget,
    updateUserOrder,
   
    
}
