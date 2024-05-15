const express = require("express");
const router = express.Router();
const couponCollection= require('../model/coupon');
const Product = require("../model/product");
const ProductOffer =require('../model/productOffer')
const categoryOffer =require('../model/categoryOffer')
const Ordercollection = require("../model/order");
const productoffer = require("../model/productOffer");






///coupon render
const couponget = async(req, res) => {
    const coupondataa=await couponCollection.find()
    res.render('couponManagement',{coupondataa})
}


/// add coupon
const addcouponget = async(req, res) => {
    res.render('addCoupon')
}


/// add coupon post
const addcouponpost = async(req, res) => {
  console.log("couponnnnnnnnnnnnnnnnnn",req.body);
  try{
    const couponData = {
        coupencode:req.body.couponCode,
            discount:req.body.discount,
        expiredate:req.body.expiredate,
            purchaseamount:req.body.purchaseamount,  
}
console.log('dataaaaaaaaaaaaa',couponData);
       
 await couponCollection.insertMany(couponData)
 res.redirect('/couponManagement')
}catch(err){
    console.log("Insert failed",err);
    res.redirect('/addCoupon')
}
}



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
const addProductOffer = async(req,res)=>{
  try{
    res.render('addProductOffer')
  }catch (error) {
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
const addCategoryOffer = async(req,res)=>{
  try{
    res.render('addCategoryOffer')
  }catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
}
}

/// add Brand Offer post
const addCategoryOfferpost=async(req,res)=>{

  const CategoryOffer={
    category:req.body.category,
    alloffer:req.body.alloffer,
  }
  try{
    const newCategoryOffer = await categoryOffer.create(CategoryOffer)
    console.log("gdfhgsdhfgvsdghzfgc",newCategoryOffer);
    res.redirect('/offerManagement'); 
      }catch (err) {
        console.log("Insert failed", err);
        res.redirect('/addCategoryOffer');
      }
    }

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