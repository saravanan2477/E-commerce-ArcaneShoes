const express = require("express");
const router = express.Router();
const couponCollection= require('../model/coupon');
const Product = require("../model/product");






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



module.exports = {
    couponget,
    addcouponget,
    addcouponpost,
     deleteCoupon
}