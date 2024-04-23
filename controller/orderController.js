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
          email:req.body.email,
         }
         console.log("sucess",address);
       const b=  await Address.insertMany([address]) 
       res.redirect("/checkoutPage")
       console.log("b",b); 
          }catch(error){
          console.log(error.message);
        }
      },
       
  postcheckout: async (req, res) => {
    console.log("here the post req", req.body);
    try {
        const { shippingOption, paymentMethod } = req.body;
        const userId = req.session.userid;
        const currentdate = new Date()

        // Fetch user details like username, you may need to adjust this based on your user model
        const user = await UserCollection.findById(userId);

        // Fetch the selected address
        const address = await Address.findById(shippingOption);

        // Fetch items from the cart for the current session user
        const cartItems = await Cart.find({ userid: userId });

        // Calculate total price
        let totalPrice = 0;
        cartItems.forEach(item => {
            totalPrice += item.price * item.quantity;
        });

        // Construct order object
        const orderProducts = cartItems.map(item => ({
          productid: item.productid,
          productName: item.productname,
          Category: item.Category,
          price: item.price,
          quantity: item.quantity,
          image:item.image,
         // Ensure that the image URLs are correctly assigned here
          status: 'pending' // or any other default status
      }));

        // Update stock for each product in the order
        for (const item of orderProducts) {
            const product = await Product.findById(item.productid);
            if (!product) {
                return res.status(404).send(`Product with ID ${item.productid} not found.`);
            }
            // Reduce the stock by the quantity ordered
            product.stock -= item.quantity;
            await product.save();
        }

        // Construct order object
        const order = new Ordercollection({
            userid: userId,
            Username: user.username,
            productcollection: orderProducts,
            address: {
                firstname: address.firstname,
                lastname: address.lastname,
                address: address.address,
                city: address.city,
                pincode: address.pincode,
                state: address.state,
                phone: address.phone,
                email: address.email
            },
            paymentMethod: paymentMethod,
            totalPrice: totalPrice,
            orderDate: currentdate,
      

        });

        // Save the order to the database
        await order.save();

        // Clear the user's cart
        await Cart.deleteMany({ userid: userId });

        // Redirect to a thank you page or any other appropriate page
        res.redirect("/placeOrder");
    } catch (error) {
        console.log(error);
        res.status(500).send('Error placing order');
    }
}


      ,
       




      Placeorder : async (req, res) => {
        try {
          // Process the order and save it to the database
          const newOrder = new Ordercollection({ /* Your order data */ });
          await newOrder.save();
      
          // Optionally, you can retrieve the newly created order ID and send it back as a response
         res.render("placeOrder")
        } catch (error) {
          console.error(error);
          return res.status(500).send("Failed to place the order.");
        }
      },
      


      showUserOrders  : async (req, res) => {
        try {
            const userid = req.session.userid;
            const orders = await Ordercollection.find({ userid: userid }).sort({ orderDate: -1 });
            const Categorie = await Category.find();
     
            res.render('userOrders', { Categorie, orders });
        } catch (error) {
            console.log(error);
            res.status(500).send("Error rendering user orders");
        }
      },
      
      



  // Assuming you have a route to fetch all products
  orderDetailsget: async (req, res) => {
    console.log("entered order detail page");
    try {
        const orderid = req.params.orderid;
        const order = await Ordercollection.findById(orderid);

        if (!order) {
            return res.status(404).send('Order not found');
        }
 // Fetch the billing address associated with the order
 const address = await Address.findOne({ userid: order.userid });
        // Render the order details using the EJS template and pass the order object

         // Determine payment status based on your logic, for example, checking if the paymentMethod is 'paid'
         const paymentStatus = order.paymentMethod === 'paid' ? 'paid' : 'unpaid';

        res.render('orderDetails', { order,address , orderid, paymentStatus});
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}
























}

