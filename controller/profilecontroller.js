const express = require('express');
const session = require('express-session');
const UserCollection = require('../model/users')
const Address= require('../model/address')
const Category = require("../model/category");
const bcryptjs = require("bcryptjs")


//  const { getEditProfile, postEditProfile } = require('../controllers/userController');




const showUserUi = async(req, res) => {
  console.log(req.session.userid)
  try {
    const user = await UserCollection.findOne({_id:req.session.userid})
    console.log(user);
    res.render('userProfile',{user});
  } catch (error) {
    console.log(error.message)
  }
}

//! edit profile Get 


const editProfileGet=async(req,res)=>{
    
  try {
    res.render('editProfile')
  } catch (error) {
    console.log(error.message)
  }
}

//!post

const editProfilePost = async (req, res) => {
  try {
    const userId = req.session.userid;

    // Update User data
    await UserCollection.findOneAndUpdate(
      { _id: userId }, 
      { username: req.body.username, email: req.body.email }
    );

    // If you want to update address as well, you need to handle it here
    // For example, fetch the address and update it in a similar way as user data

    res.redirect('/userProfile');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};



//!user change password GEt

const changePasswordGet = async (req, res) => {
  let errorMessage = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
};

// Render the EJS template and pass the errorMessage object to it
res.render('changePassword', { errorMessage: errorMessage });
}

//!post
const  changePasswordPost = async (req, res) => {
 const userId = req.session.userid;
 console.log('Session user ID:', userId);

 const { currentPassword, newPassword } = req.body;
 console.log('Current password input:', currentPassword);

 try {
      const user = await UserCollection.findById(userId);

      // Backend validation for current password
      const isMatch = await bcryptjs.compare(currentPassword, user.password);
      console.log('Password match result:', isMatch);

      if (!isMatch) {
          return res.render('changePassword', {
              errorMessage: {
                 currentPassword: 'Incorrect current password.',
                 newPassword: '',
                 confirmPassword: '',
                 general: '',
              },
              Categorie: await Category.find({})
          });
      }

      if (newPassword.length < 5) {
          return res.render('changePassword', {
              errorMessage: {
                 currentPassword: '',
                 newPassword: 'New password must be at least 5 characters long.',
                 confirmPassword: '',
                 general: '',
              },
              Categorie: await Category.find({})
          });
      }

      // Hash the new password before saving
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(newPassword, salt);

      // Update user password
      user.password = hashedPassword;
      await user.save();

      res.redirect('/userProfile');
 } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
 }
};
    


//! user address


const showUserAddress = async(req,res)=>{
  try{
    const sessionuserId= req.session.userid
    console.log("session",sessionuserId);
    const address=await Address.find({userid:sessionuserId})
    console.log("hejhjkjeejkjufrvjnrgunjrgi",address);
    res.render('userAddress',{address})
  } catch(error){
      console.log(error.message);
  }
}


const addAddress= async(req,res)=>{
  try{
    res.render('addAddress')
  } catch(error){
    console.log(error.message);
  }
}

//! add address post

const addAddresspost = async(req,res)=>{
  try{
   const a=req.session.userid
  //  console.log('a',a);
   const address = {
    userid:req.session.userid,
    firstname:req.body.firstname,
    lastname:req.body.lastname,
    address:req.body.address,
    city:req.body.city,
    pincode:req.body.pincode,
    state:req.body.state,
    phone:req.body.phone,
    email:req.body.email
   }
   console.log("sucess",address);
 const b=  await Address.insertMany([address]) 
 res.redirect("/userAddress")
 console.log("b",b); 
    }catch(error){
    console.log(error.message);
  }
}
 

//!edit address get


// const editAddressget= async(req,res)=>{
//   console.log("3333333333333333333333");

//   try{
//     res.render('editAddress')
//   } catch(error){
//     console.log(error.message);
//   }
// }
async function getAddressById(id) {
  try {
      const address = await Address.findById(id);
      console.log('Fetched address:', address);
      return address;
  } catch (error) {
      console.error('Error fetching address:', error);
      throw error;
  }
}

const editAddressget= async (req, res) => {
  const addressId = req.params.id;
  console.log(`Handling request for address ID: ${addressId}`);
  try {
      const address = await getAddressById(addressId);
      console.log('Fetched address:', address);
      if (address) {
          // Render the edit form with the address details
          res.render('editAddress', {  address });
      } else {
          // Handle the case where the address is not found
          res.status(404).send('Address not found');
      }
  } catch (error) {
      // Handle any errors that occur while fetching the address
      console.error(error);
      res.status(500).send('An error occurred');
  }
};



//!edit addresspost

async function updateAddress(id, updatedAddress) {
  try {
      const address = await Address.findByIdAndUpdate(id, updatedAddress, { new: true });
      if (!address) {
          console.error('Address not found');
          throw new Error('Address not found');
      }
      console.log('Address updated successfully:', address);
      return address;
  } catch (error) {
      console.error('Error updating address:', error);
      throw error;
  }
}

const editAddresspost =async (req, res) => {
  const addressId = req.params.id;
  const updatedAddress = req.body; // This assumes you're using body-parser middleware
  try {
      const address = await updateAddress(addressId, updatedAddress);
      if (address) {
          // Redirect the user to the address list or a confirmation page
          res.redirect('/userAddress');
      } else {
          // Handle the case where the address update failed
          res.status(500).send('Failed to update address');
      }
  } catch (error) {
      // Handle any errors that occur while updating the address
      console.error(error);
      res.status(500).send('An error occurred');
  }
};


//!delete address


const deleteAddressget = async (req,res)=>{
  const del=req.params.id
  console.log("deleted is",del );

const addressdelete= await Address.findByIdAndDelete(del)
.then(x=>{
  console.log('address deleted',x);
  res.redirect("/userAddress")
})
.catch(x=>{
  console.log("erroe in deletion");
  res.redirect("/userAddress")
})

}




const showUserOrders = async(req, res) => {
  try {
    res.render('userOrders')
  } catch (error) {
    console.log(error.message)
  }
}
module.exports= {
  showUserUi,
  editProfileGet,
  editProfilePost,
  changePasswordGet,
  changePasswordPost,
  showUserOrders,
  showUserAddress,
  addAddress,
  addAddresspost,
  deleteAddressget,
  editAddressget,
  editAddresspost
 
}