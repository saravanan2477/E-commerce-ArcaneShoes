const express = require("express");
const Ordercollection=require("../model/order")
const Cart= require("../model/cart")
const Product = require("../model/product");
const UserCollection=require("../model/users")
const Address= require('../model/address')
const Category = require("../model/category");
const wallet = require("../model/wallet")



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
console.log("CartItems",cartItems);
        // Calculate total price
        let totalPrice = 0;
        cartItems.forEach(item => {
            totalPrice += item.price * item.quantity;
        });

        // Construct order object
        const orderProducts = cartItems.map(item => ({
          productid: item.productid,
          productName: item.productname,
          //Category: item.Category,
          price: item.price,
          quantity: item.quantity,
          image:item.image,
          status: 'pending' 
      }));                        
        let product
        // Update stock for each product in the order
        console.log('size',orderProducts);
        for (const item of orderProducts) {
          console.log('here the for of loop');
             product = await Product.findById(item.productid);
            if (!product) {
                return res.status(404).send(`Product with ID ${item.productid} not found.`);
            }
            // Reduce the stock by the quantity ordered
            product.stock -= item.quantity;
        }
   
        await product.save();
        // Construct order object
        const order = new Ordercollection({
            userid: userId,
            Username: user.username,
            productcollection: orderProducts,
            addresscollection: {
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
        console.log("entered save ");

        // Clear the user's cart
        await Cart.deleteMany({ userid: userId });

        // Redirect to a thank you page or any other appropriate page
        res.redirect("/placeOrder");
    } catch (error) {
        console.log(error);
        res.status(500).send('Error placing order');
    }
},  


      
       




      Placeorder : async (req, res) => {
        try {
          // Process the order and save it to the database
          // const newOrder = new Ordercollection({ /* Your order data */ });
          // await newOrder.save();
      
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
        const productid = req.params.productid;
        
        // Find the order that matches the order id and contains the product with the specified product id
        const order = await Ordercollection.findOne({
            _id: orderid,
            "productcollection.productid": productid
        });

        if (!order) {
            return res.status(404).send('Order not found');
        }

        // Find the specific product within the order
        const product = order.productcollection.find(product => product.productid.toString() === productid);
    console.log(product,'fall')
        if (!product) {
            return res.status(404).send('Product not found in the order');
        }

        // Fetch the billing address associated with the order
        const address = await Address.findOne({ userid: order.userid });

        // Determine payment status based on your logic
        const paymentStatus = order.paymentMethod === 'paid' ? 'paid' : 'unpaid';
        console.log(order,"this is ior");

        res.render('orderDetails', { product, order, address, orderid, paymentStatus });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
},

cancelOrder: async (req, res) => {
    try {
        const { orderId, productId } = req.params;

        // Find the order by ID
        const order = await Ordercollection.findById(orderId);
        if (!order) {
            return res.status(404).send(`Order with ID ${orderId} not found.`);
        }

        // Find the product within the order and update its status to "cancelled"
        const productIndex = order.productcollection.findIndex(product => product.productid == productId);
        if (productIndex === -1) {
            return res.status(404).send(`Product with ID ${productId} not found in order.`);
        }

        const cancelledProduct = order.productcollection[productIndex];

        // Check if the payment has been made for the order
        if (order.paymentMethod === 'Net Banking') {
            // Refund the user
            const totalRefund = cancelledProduct.price * cancelledProduct.quantity;

            // Update user's wallet
            const user = await UserCollection.findById(order.userid);
            user.wallet += totalRefund;
            await user.save();

            // Create a refund entry in the wallet collection
            await wallet.create({
                userid: order.userid,
                date: new Date(),
                amount: totalRefund,
                creditordebit: 'credit',
            });

            console.log('Refund processed successfully:', totalRefund);
        }

        // Update product status to "Cancelled"
        cancelledProduct.status = 'Cancelled';

        // Save the updated order
        await order.save();

        // Redirect to the page where orders are displayed
        res.redirect('/userOrders');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
},

  






orderReturn: async (req, res) => {
    try {
        console.log("entered 'return order'");
        const userid = req.params.userid;
        const productid = req.params.productid;
        const selectedstatus = 'Returned';
        const idofuser = req.session.userid
        console.log(userid, productid, selectedstatus);

        // Retrieve order details
        const order = await Ordercollection.findOne({
            _id: userid,
            "productcollection.productid": productid
        });
        console.log(order, "this is the order");

        if (!order) {
            return res.status(404).send("Order not found");
        }

        const product = order.productcollection.find(product => product.productid.toString() === productid);
        if (!product) {
            return res.status(404).send("Product not found in the order");
        }

        const { price, quantity } = product;

        // Update order status to 'Returned'
        await Ordercollection.updateOne(
            { 'userid': userid, 'productcollection.productid': productid },
            { $set: { 'productcollection.$.status': selectedstatus } }
        );
      
        // Add stock back to the Product database
        await Product.findOneAndUpdate(
            { _id: productid },
            { $inc: { Stock: quantity } }
        );


        if (order.paymentMethod == 'Net Banking') {
            console.log("inside net banking");
            const totalAmount = price * quantity ;
            console.log(totalAmount)
           let userorder =  await UserCollection.findOneAndUpdate(
                { _id: idofuser },
                { $inc: { wallet: totalAmount } }
            );

            console.log("user id is ", idofuser);

            console.log("detail of the order is ",userorder);
            await wallet.create({
                userid:idofuser,
                date: new Date(),
                amount: totalAmount,
                creditordebit: 'credit',
              });
              console.log("Wallet updated successfully");
        } else {
            console.log("order cancelled");
        }


        product.status = selectedstatus;

        // Save the updated order to the database
        await order.save();
        console.log("Order returned successfully");
        res.redirect('/userOrders');

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error returning order" });
    }
}























}

