const express = require("express");
const Cart= require("../model/cart")
const Product = require("../model/product");
const UserCollection=require("../model/users")



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
        const product = await Product.findOne({ _id: productId });
        if (!product) {
            return res.status(404).send('Product not found');
        }
        let cartItem = await Cart.findOne({ productid: productId, userid: sessionId });
        if (cartItem) {
            cartItem.quantity += 1;
        } else {
            cartItem = new Cart({
                productid: productId,
                userid: sessionId,
                productname: product.productname,
                price: product.price,
                quantity: 1,
                image: product.image
            });
        }
        await cartItem.save();
        res.redirect('/cart');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error22');
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



//   updateQuantity: async (req, res) => {
//     try {
//         const { productId, action } = req.params;
//         const sessionId = req.session.userid; // Assuming you're using Express session or a similar mechanism

//         const cartItem = await Cart.findOne({ productid: productId, userid: sessionId });
//         if (!cartItem) {
//             return res.status(404).send('Item not found in cart');
//         }

//         let newQuantity = action === 'decrease' ? Math.max(1, cartItem.quantity - 1) : cartItem.quantity + 1;
//         cartItem.quantity = newQuantity;
//         await cartItem.save();

//         res.redirect('/cart'); // Redirect to the cart page after updating the quantity
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Server Error');
//     }
// },          

       

updateQuantity: async (req, res) => {
  try {
      const { productid, index, action } = req.body;
      const cartItem = await Cart.findById(productid);
      const product = await Product.findById(cartItem.productid);
      if (!cartItem) {
          return res.status(404).json({ error: 'CartItem not found' });
      }
      if (action === 'increase') {
          cartItem.quantity += 1;
      } else if (action === 'decrease' && cartItem.quantity > 1) {
          cartItem.quantity -= 1;
      }
      const itemTotal = cartItem.price * cartItem.quantity;
      await cartItem.save();

      const cartItems = await Cart.find({ userid: req.session.userid });
      let subtotal = 0;
      cartItems.forEach((cartItem) => {
          subtotal += cartItem.price * cartItem.quantity;
      });

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



