const express = require('express');
const Razorpay = require('razorpay');
require('dotenv').config(); 


// console.log(instance);
const orderpayment = async (req, res) => {
  try { 
    console.log('this is online payment starting');
    const { amount } = req.body;
    console.log('price from the payhment controler',typeof(amount));
    var instance = new Razorpay({ key_id: process.env.KEY_ID, key_secret: process.env.KEY_SECRET });
    var options = {
        amount: amount * 100, 
        currency: "INR",
        receipt: "order_rcptid_11",
    };
    // console.log(process.env.KEY_ID);
    // Creating the order
    instance.orders.create(options, function (err, order) {
      if (err) {
        console.error(err);
        console.log('error in creating an error');
        res.status(500).send("Error creating order");
        return;
      }
      // console.log("order is",order);``
      // Add orderprice to the response object
      console.log('last');
      res.send({ orderId: order.id });
      // Replace razorpayOrderId and razorpayPaymentId with actual values
      // Redirect to /orderdata on successful payment
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};



const paymentFailed = ( req,res)=>{
  try {
     res.render('paymentFailed')
  } catch (error) {
    console.log(error);
    
  }
}




module.exports = {
  orderpayment,
  paymentFailed
}