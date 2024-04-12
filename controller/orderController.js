const express = require("express");
const Ordercollection=require("../model/order")
const Cart= require("../model/cart")
const Product = require("../model/product");
const UserCollection=require("../model/users")
const Address= require('../model/address')
const Category = require("../model/category");



module.exports={


    getcheckout: async (req, res) => {
        try {
            const userId = req.session.userid;
            const sessionId = req.session.userid;
            
            const checkout = await Cart.find({ userid: sessionId });
    
            let totalsum = 0;
            checkout.forEach((items) => {
                const totalitems = items.price * items.quantity;
                totalsum += totalitems;
            })
    
            const address = await Address.find({ userid: userId });
    
          
    
    
            
            res.render('CheckoutPage', { checkout, address,  totalsum });
        } catch (error) {
            console.log(error);
            res.status(500).send('Error in product details');
        }
    },


     addAddresscheckout:async(req,res)=>{
        try{
          res.render('orderAddress')
        } catch(error){
          console.log(error.message);
        }
      },
      
      //! add address post
      
      addAddresspostcheckout : async(req,res)=>{
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
       res.redirect("/checkoutPage")
       console.log("b",b); 
          }catch(error){
          console.log(error.message);
        }
      },
       




      Placeorder: async (req, res) => {
        try{
            res.render('placeOrder')
        
        } catch (error) {
            console.log(error);
            res.status(500).send('Error in product details');
        }
    }



















}

