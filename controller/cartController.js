const express = require("express");
const Cart= require("../model/cart")
const Product = require("../model/product");
const Category = require("../model/category");
const UserCollection=require("../model/users")
const ProductOffer= require('../model/productOffer')
const categoryOffer =require('../model/categoryOffer')
const couponCollection= require('../model/coupon');


module.exports =  {


 
  getCart: async (req, res) => {
    try {
        const sessionId = req.session.userid;
        const cartfind = await Cart.find({ userid: sessionId });

        if (!sessionId) {
            return res.status(400).send('Session not found');
        }

        let overallTotalSum = 0;
        cartfind.forEach((cartItem) => {
            const itemTotal = cartItem.price * cartItem.quantity;
            overallTotalSum += itemTotal;
        });

        const cartItems = await Cart.find({ userid: sessionId });
        res.render('cart', { cartfind: cartItems, overallTotalSum });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error11');
    }
},

addToCart: async (req, res) => {
  try {
      const sessionId = req.session.userid;
      const productId = req.params.productId;
      const product = await Product.findOne({ _id: productId }).populate("category");


      const pname = product.productname;    
      // Retrieve product offer
      const pOffer = await ProductOffer.findOne({ productname: pname });
      console.log('product offer is ',pOffer)
      // Calculate product discount
      let discountAmount = 0;
      if (pOffer) {
          const originalPrice = parseFloat(product.price);
          const discountPercentage = parseFloat(pOffer.productoffer);
          discountAmount = (originalPrice * discountPercentage) / 100;


          console.log('product offer is ',pOffer)
          console.log('originalPrice of poduct is ',originalPrice)
          console.log('discountPercentage is ',discountPercentage)
          console.log('discountAmount is ',discountAmount)
      }

      
      // Retrieve category offer
      const CategoryOffer = await categoryOffer.findOne({ category: { $regex: new RegExp (Category.category ,'i')} });    
      console.log('category offer is ',CategoryOffer)

      // Calculate category discount
      if (categoryOffer) {
          const originalPrice = parseFloat(product.price);
          const discountPercentage = parseFloat(CategoryOffer.alloffer);
          const categoryDiscountAmount = (originalPrice * discountPercentage) / 100;
          console.log('originalPrice offer of category  is ',originalPrice)
          console.log('discountPercentage offer is ',discountPercentage)
          console.log('categoryDiscountAmount offer is ',categoryDiscountAmount)

          // If the category offer provides a higher discount than the product offer, update discountAmount
          if (categoryDiscountAmount > discountAmount) {
              discountAmount = categoryDiscountAmount;
          }
      }

      if (!product) {
          return res.status(404).send('Product not found');
      }

      // Add product to cart with discounted price
      let cartItem = await Cart.findOne({ productid: productId, userid: sessionId });
      if (cartItem) {
          cartItem.quantity += 1;
      } else {
          cartItem = new Cart({
              productid: productId,
              userid: sessionId,
              productname: product.productname,
              price: parseFloat(product.price) - discountAmount, // Apply discount
              quantity: 1,
              image: product.image
          });
      }

      await cartItem.save();
      res.redirect('/cart');
  } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
  }
},


    
    


    removeCartItem: async (req, res) => {
      const pid=req.params.productId
      console.log(
        'id is',pid
      ); 
        const removecart=await Cart.findByIdAndDelete(pid)
        .then(x=>{
          console.log(' deleted',x)
          res.redirect('/cart')
        })
        .catch(x=>{
          console.log('error in deletion');
          res.redirect('/Homepage')
        })
  },


     

       

updateQuantity: async (req, res) => {
  try {
    const { productid, index, action } = req.body;
    const cartItem = await Cart.findById(productid);
    const product = await Product.findById(cartItem.productid);
    
    if (!cartItem) {
      return res.status(404).json({ error: 'CartItem not found' });
    }

    // Determine the maximum quantity allowed for the product
    const maxQuantity = product.stock;

    // Update the quantity based on the action (increase or decrease)
    if (action === 'increase') {
      // Check if the quantity is already at the maximum allowed
      if (cartItem.quantity < maxQuantity) {
        cartItem.quantity += 1;
      } else {
        // If quantity is already at the maximum, send an alert message
        return res.status(400).json({ error: 'Maximum quantity reached' });
      }
    } else if (action === 'decrease' && cartItem.quantity > 1) {
      cartItem.quantity -= 1;
    }

    // Calculate the total price for the cart item
    const itemTotal = cartItem.price * cartItem.quantity;

    // Save the updated cart item
    await cartItem.save();

    // Fetch all cart items for the user
    const cartItems = await Cart.find({ userid: req.session.userid });

    // Calculate subtotal
    let subtotal = 0;
    cartItems.forEach((cartItem) => {
      subtotal += cartItem.price * cartItem.quantity;
    });

    // Send response with updated cart item, subtotal, and total
    res.status(200).json({
      success: true,
      updatedCartItem: { ...cartItem.toObject(), itemTotal },
      subtotal,
      total: subtotal // You may adjust this based on your calculation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}























}



