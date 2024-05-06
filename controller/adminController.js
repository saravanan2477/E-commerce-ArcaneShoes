const express = require("express");
const adminCollections = require("../model/admin");
const UserCollection=require("../model/users")
const Category = require("../model/category");
const Ordercollection = require("../model/order")
const Product = require("../model/product");

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
            
        }
    } catch (error) {
        console.log("Error:", error);
        res.status(500).send("Internal Server Error");
    }
};


//dashboard get
const dashboard =  async (req, res) => {

  console.log("got in to dashbaord");
    if (req.session.admin) {
      try {
        // Daily Orders
        const dailyOrders = await Ordercollection.aggregate([
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
              orderCount: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]);
        console.log("Daily Orders:", dailyOrders);
  
        const { dates, orderCounts, totalOrderCount } = dailyOrders.reduce(
          (result, order) => {
            result.dates.push(order._id);
            result.orderCounts.push(order.orderCount);
            result.totalOrderCount += order.orderCount;
            return result;
          },
          { dates: [], orderCounts: [], totalOrderCount: 0 }
        );
        // monthly
        const monthlyOrders = await Ordercollection.aggregate([
          {
            $group: {
              _id: {
                year: { $year: "$orderDate" },
                month: { $month: "$orderDate" },
              },
              orderCount: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);
        console.log("monthlyData Orders:", monthlyOrders);
        const monthlyData = monthlyOrders.reduce((result, order) => {
          const monthYearString = `${order._id.year}-${String(
            order._id.month
          ).padStart(2, "0")}`;
          result.push({
            month: monthYearString,
            orderCount: order.orderCount,
          });
          return result;
        }, []);
        let monthdata = orderCounts;
  
        //  Yearly Order
        const yearlyOrders = await Ordercollection.aggregate([
          {
            $group: {
              _id: { $dateToString: { format: "%Y", date: "$orderDate" } },
              orderCount: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]);
        console.log("years Orders:", yearlyOrders);
        const { years, orderCounts3, totalOrderCount3 } = yearlyOrders.reduce(
          (result, order) => {
            result.years.push(order._id);
            result.orderCounts3.push(order.orderCount);
            result.totalOrderCount3 += order.orderCount;
            return result;
          },
          { years: [], orderCounts3: [], totalOrderCount3: 0 }
        );
  
  
        const topsellingproduct = await Ordercollection.aggregate([
          {
            $unwind: "$productcollection" // Deconstruct the productcollection array
          },
          {
            $group: {
              _id: "$productcollection.productid", // Group by product id
              totalQuantity: { $sum: "$productcollection.quantity" }, // Calculate total quantity sold for each product
              productName: { $first: "$productcollection.productName" } // Retrieve the productName
            }
          },
          {
            $sort: { totalQuantity: -1 } // Sort by total quantity sold in descending order
          },
          {
            $limit: 5 // Limit the result to the top 5 products
          }
        ]);
        topsellingproduct.sort((a, b) => b.totalQuantity - a.totalQuantity);

  console.log("topsellingproduct",topsellingproduct);
  // Extracting product names into an array
const productNamess = topsellingproduct.map(product => product.productName);

console.log("Product Names in Descending Order of Quantity:", productNamess);
const categories = [];
for (const productName of productNamess) {
// Find the product document by name
const productDoc = await Product.findOne({ productname: productName }).populate('category');

            console.log("productnames",productDoc);
// Extract category from the document
const category = productDoc.category;

// Push the category to the categories array
categories.push(category.category);
console.log("categories",categories);
const categoryCount = {};
categories.forEach(category => {
  categoryCount[category] = (categoryCount[category] || 0) + 1;
});
const sortedCategoryCount = Object.entries(categoryCount)
  .sort((a, b) => b[1] - a[1])
  .reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});
  console.log("sortedObject",sortedCategoryCount);
  var entriesArray = Object.entries(sortedCategoryCount);


console.log("entriesArray", entriesArray);
}
        const productNames = [];
        const sellingQuantities = [];
  
        // Iterate over the aggregation result
        topsellingproduct.forEach(product => {
          productNames.push(product.productName); // Push product name to productNames array
          sellingQuantities.push(product.totalQuantity); // Push total quantity to sellingQuantities array
        });
  
  
  
          res.render('dashboard',{
            dates,
            orderCounts,
            totalOrderCount,
            monthdata,
            years,
            orderCounts3,
            totalOrderCount3,
            productNames,
            sellingQuantities,
            entriesArray
          });
        }
        catch (error) {
          console.error("Error fetching and aggregating orders:", error);
          res.status(500).send("Internal Server Error");
        }
      }
  
      else {
        res.redirect("/adminlogin");
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
    const name = req.body.name.trim();  
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
    try {
        const id = req.params.id;
        const categoryname = req.body.categoryname.trim();
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

        // Update the category name
        await Category.updateOne(
            { _id: id },
            { $set: { category: categoryname } }
        );

        // Redirect to category management page upon successful update
        return res.redirect("/admin/categorymanagement");
    } catch (err) {
        console.error("Error editing category:", err);
        return res.status(500).send("Failed to edit category.");
    }
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
  
      // Update the 'islisted' field to its opposite value
      category.islisted = !category.islisted;
  
      // Save the updated category
      await category.save();

      // Find all products with the same category and update their isListed status
      await Product.updateMany({ category: category._id }, { isListed: category.islisted });
  
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


//!order page

const orderget = async(req,res)=>{
  try{
  const orderdetalist = await Ordercollection.find().sort({ orderDate: -1 });
// console.log(orderdetalist,"orders are here");
    res.render("orderManagement",{orderdetalist});
  }
  catch(err){
    console.log("error");
  return res.status(500).send("Failed to order page.");

  }
}


const updateOrderpost = async (req, res) => {
  const { orderId, productId } = req.params;
  const { status } = req.body;
  console.log(orderId,productId,status);
  try {
      // Update the status of the product in the order
      const orders = await Ordercollection.findById(orderId);
      if (!orders) {
          return res.status(404).send(`Order with ID ${orderId} not found.`);
      }
      
  

        await Ordercollection.findOneAndUpdate(
              { _id:orderId ,'productcollection.productid': productId },
              { $set: { 'productcollection.$.status': status } },
              { new: true }
            )
      .then((success)=>{     
        console.log('updataed',success);
        res.redirect('/admin/ordermanagement'); // Redirect to the page where orders are displayed
      })
      .catch(error=>{
        console.log('error',error);
        res.status(400).send('Error updating status');

      })

  } catch (error) {
      console.error(error);
      res.status(500).send('Internal server error');
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
    updateOrderpost,
   
    
}
