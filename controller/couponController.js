const express = require("express");
const router = express.Router();
const couponCollection= require('../model/coupon');
const Product = require("../model/product");
const Category = require("../model/category");
const ProductOffer =require('../model/productOffer')
const categoryOffer =require('../model/categoryOffer')
const Ordercollection = require("../model/order");
const productoffer = require("../model/productOffer");






///coupon render
const couponget = async(req, res) => {
    const coupondata=await couponCollection.find()
    console.log("coupdata is ",coupondata)
    res.render('couponManagement',{coupondata})
}


/// add coupon
const addcouponget = async(req, res) => {
    res.render('addCoupon')
}


/// add coupon post
const addcouponpost = async (req, res) => {
  console.log("couponnnnnnnnnnnnnnnnnn", req.body);
  try {
    const { couponCode, discount, expiredate, purchaseamount } = req.body;

    // Check if the coupon code already exists
    const existingCoupon = await couponCollection.findOne({ coupencode: couponCode });

    if (existingCoupon) {
      console.log("Coupon code already exists.");
      // Pass an error message to the frontend and return to prevent further execution
      return res.render("addCoupon", { message: "Coupon already exists!" });
    }

    const coupondata = {
      coupencode: couponCode,
      discount,
      expiredate: new Date(expiredate),
      purchaseamount,
    };

    console.log('dataaaaaaaaaaaaa', coupondata);

    await couponCollection.insertMany([coupondata]);  // Note: insertMany takes an array
    return res.redirect('/couponManagement');
  } catch (err) {
    console.log("Insert failed", err);
    return res.status(500).json({ error: "Insert failed. Please try again later." });
  }
};






//Delete coupon 
const deleteCoupon=async(req,res)=>{
    try{
        const Couponid=req.params.id;
        await couponCollection.findByIdAndDelete(Couponid);
        res.redirect('/couponManagement')
        }catch(error){
            console.error(err);
            return res.status(500).send("Failed to delete Coupon.");
          }
    }




//! user coupon show

const allCouponsget=async(req,res)=>{
  const showcoupon= await couponCollection.find()
  res.render('allCoupons',{showcoupon})
}

const coupencheck = async (req, res) => {
  try {
      console.log('coupon appled suceessons ')
      let currentDate = new Date();
      const couponcode = req.body.coupencode;
      
      if (req.session.coupon && couponcode.toLowerCase() === req.session.coupencode.toLowerCase()) {
          console.log('inside the lowercase session');
          return res.status(400).json({
              success: false,
              message: 'Coupon code has already been applied.',
          });
      }
      console.log('coupen session value is coupen',req.session.coupon);
      console.log('coupen session value is coupencode',req.session.coupencode);
      const coupon = await couponCollection.findOne({ 
          coupencode: { $regex: new RegExp(couponcode, 'i') } });
      console.log(coupon && coupon.expiredate > currentDate)

      if (coupon && coupon.expiredate > currentDate && couponcode.toLowerCase() === coupon.coupencode.toLowerCase()) {
          console.log('here if')
          const discountAmount = coupon.discount;
          const amountLimit = coupon.purchaseamount;            
          req.session.coupencode = coupon.coupencode;

          return res.json({ success: true, discount: discountAmount, amount: amountLimit });
      } else {
          console.log('inside the expire');
          return res.status(400).json({
            
              success: false,
              message: 'Invalid coupon code or expired.',
          });
      }
  } catch (error) {
      console.error('Error in coupencheck:', error);
      return res.status(500).json({
          success: false,
          message: 'Internal server error during coupon validation.',
      });
  }
};



const couponremove = async(req,res)=>{
  try {
      const { couponCode } = req.body;

      await Ordercollection.updateMany({}, { $set: { Discount: 0, intDiscount: 0 } });

      // Send a success response
      req.session.coupencode=null
      req.session.coupon=null
      res.json({ success: true });
  } catch (error) {
      console.error('Error deleting coupon:', error);
      res.json({ success: false });
  }
};












    //!product offer show


    const poductOffer = async (req, res) => {
        try {
          const newproductOffer = await ProductOffer.find({});
          const categoryOffers = await categoryOffer.find({ category: { $exists: true } });
          res.render('offerManagement', { newproductOffer,categoryOffers}); // Pass the data to the view
        } catch (error) {
          console.log(error);
          res.status(500).send("Internal Server Error");
        }
      }
/// add product Offer 
// Updated addProductOffer controller function
const addProductOffer = async (req, res) => {
  try {
    const products = await Product.find({}, 'productname'); // Fetch product names
    res.render('addProductOffer', { products }); // Pass products to the view
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
}


/////// add product offer post 
const productOfferpost = async (req,res)=>{

const productOffer={
  productname:req.body.productName,
  price:req.body.productPrice,
  productoffer:req.body.offerPercentage,
}
console.log("this is the product offer",productOffer);
  try{
const newproductOffer = await ProductOffer.create(productOffer)
console.log("this is the new product offer",newproductOffer);
res.redirect('/offerManagement'); 
  }catch (error) {
    console.log("Insert failed", error);
    res.redirect('/addProductOffer');
  }
}


//// productOffer Delete
const DeleteProductOffer = async(req,res)=>{
  try{
    const productOfferid=req.params.id;
    console.log('productOfferid',productOfferid);
    await ProductOffer.findByIdAndDelete(productOfferid);
    res.redirect('/offerManagement')
  }catch(error){
      console.error(error);
      return res.status(500).send("Failed to delete Coupon.");
    }
}


///// category offer 
// Updated addCategoryOffer controller function
const addCategoryOffer = async (req, res) => {
  try {
    const categories = await Category.find({}, 'category'); // Fetch category names
    res.render('addCategoryOffer', { categories }); // Pass categories to the view
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
}


/// add Brand Offer post
const addCategoryOfferpost = async (req, res) => {
  const CategoryOffer = {
    category: req.body.category,
    alloffer: req.body.alloffer,
  };

  try {
    const newCategoryOffer = await categoryOffer.create(CategoryOffer);
    console.log("New category offer added:", newCategoryOffer);
    res.redirect('/offerManagement'); 
  } catch (err) {
    console.error("Failed to add category offer:", err);
    res.redirect('/addCategoryOffer');
  }
};

//// productOffer Delete
const DeleteCategoryOffer = async(req,res)=>{
  try{
    const CategoryOfferid=req.params.id;
    console.log('productOfferid',CategoryOfferid);
    await categoryOffer.findByIdAndDelete(CategoryOfferid);
    res.redirect('/offerManagement')
  }catch(error){
      console.error(err);
      return res.status(500).send("Failed to delete Coupon.");
    }
}


module.exports = {
    couponget,
    addcouponget,
    addcouponpost,
     deleteCoupon,
     allCouponsget,
     coupencheck,
     couponremove,


     poductOffer,
     addProductOffer,
     productOfferpost,
     DeleteProductOffer,

     
     addCategoryOffer,
     addCategoryOfferpost,
     DeleteCategoryOffer
}