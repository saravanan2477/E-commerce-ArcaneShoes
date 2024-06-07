const express = require("express");
const Ordercollection = require("../model/order");
const Cart = require("../model/cart");
const Product = require("../model/product");
const UserCollection = require("../model/users");
const Address = require("../model/address");
const Category = require("../model/category");
const wallet = require("../model/wallet");
const couponCollection= require('../model/coupon');
const ProductOffer = require("../model/productOffer");
const categoryOffer =require('../model/categoryOffer')
const PDFDocument = require("pdfkit");



module.exports = {
  getcheckout: async (req, res) => {
    try {
      const userId = req.session.userid;
      const sessionId = req.session.userid;

      const checkout = await Cart.find({ userid: sessionId });
      const TAX_RATE= 0.03;
      let totalsum = 0;
      let totalTax = 0; // Initialize total tax amount
      let totalDiscount = 0;

      for (const item of checkout) {
        const product = await Product.findById(item.productid);
        console.log("product is ",product)
        

        if (!product) {
          return res.status(404).send(`Product with ID ${item.productid} not found.`);
        }

        const originalPrice = item.price;
        console.log("cartprice is ",originalPrice)
        console.log("originalPrice is ",originalPrice)
        let discountAmount = 0;

        // Retrieve product offer
        const productOfferInstance = await ProductOffer.findOne({ productname: product.name });
        if (productOfferInstance) {
          const discountPercentage = parseFloat(productOfferInstance.productoffer);
          discountAmount = (parseFloat(originalPrice) * discountPercentage) / 100;
        }

        // Retrieve category offer
        const categoryOfferInstance = await categoryOffer.findOne({ category: product.category.category });


console.log("categoryOfferInstance is in get checkout ",categoryOfferInstance)
        
        if (categoryOfferInstance) {
          const discountPercentage = parseFloat(categoryOfferInstance.alloffer);
          const categoryDiscountAmount = (parseFloat(originalPrice) * discountPercentage) / 100;
          if (categoryDiscountAmount > discountAmount) {
            discountAmount = categoryDiscountAmount;
          }
        }

        const taxAmount = originalPrice * item.quantity * TAX_RATE;
        const finalPrice = (originalPrice * item.quantity) - discountAmount + taxAmount;

        totalsum += finalPrice;
        totalTax += taxAmount;
        totalDiscount += discountAmount;
        console.log("taxAmount is ",taxAmount)
console.log("finalPrice is ",finalPrice)
console.log("totalTax is ",totalTax)
console.log("totalDiscount is ",totalDiscount)
      }

      const address = await Address.find({ userid: userId });
console.log("checkout is ", checkout);
      res.render("checkoutPage", { checkout, address, totalsum, totalTax, totalDiscount });
    } catch (error) {
      console.log(error);
      res.status(500).send("Error in product details");
    }
  },

 

  postcheckout: async (req, res) => {
    console.log("here the post req", req.body);
    try {
      const { shippingOption, paymentMethod } = req.body;
      const userId = req.session.userid;
      const currentdate = new Date();

      // Fetch user details like username, you may need to adjust this based on your user model
      const user = await UserCollection.findById(userId);

      // Fetch the selected address
      const address = await Address.findById(shippingOption);

      // Fetch items from the cart for the current session user
      const cartItems = await Cart.find({ userid: userId });
      console.log("CartItems", cartItems);
      // Calculate total price
      let totalPrice = 0;
      cartItems.forEach((item) => {
        totalPrice += item.price * item.quantity;
      });

     


      // Construct order object
      const orderProducts = cartItems.map((item) => ({
        productid: item.productid,
        productName: item.productname,
        Category: item.Category,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        status: "pending",
        proffer:item.proffer*item.quantity
      }));
      let product;
      // Update stock for each product in the order
      console.log("size", orderProducts);
      for (const item of orderProducts) {
        console.log("here the for of loop");
        product = await Product.findById(item.productid);
        if (!product) {
          return res
            .status(404)
            .send(`Product with ID ${item.productid} not found.`);
        }
        // Reduce the stock by the quantity ordered
        product.stock -= item.quantity;
      }


      const couponcode = req.body.coupencode;
      let discount = 0;
      const coupon = await couponCollection.findOne({ coupencode: couponcode });

      if (coupon) {
          console.log('coupon id ', coupon._id);
          discount = coupon.discount;
          console.log("Discount: ", discount);
      } else {
          console.log('Coupon not found');
          // handle the case when the coupon is not found
      }

      const intDiscount = discount / orderProducts.length;
      console.log("Discount: ", discount);
      console.log("intDiscount isssss: ", orderProducts.length);
      


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
          email: address.email,
        },
        paymentMethod: paymentMethod,
        totalPrice: totalPrice,
        orderDate: currentdate,
        Discount: discount,
        intDiscount: intDiscount,
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
      res.status(500).send("Error placing order");
    }
  },


  addAddresscheckout: async (req, res) => {
    try {
      res.render("orderAddress");
    } catch (error) {
      console.log(error.message);
    }
  },

  //! add address post

  addAddresspostcheckout: async (req, res) => {
    try {
      const a = req.session.userid;
      //  console.log('a',a);
      const address = {
        userid: req.session.userid,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        address: req.body.address,
        city: req.body.city,
        pincode: req.body.pincode,
        state: req.body.state,
        phone: req.body.phone,
        email: req.body.email,
      };
      console.log("sucess", address);
      const b = await Address.insertMany([address]);
      res.redirect("/checkoutPage");
      console.log("b", b);
    } catch (error) {
      console.log(error.message);
    }
  },



  Placeorder: async (req, res) => {
    try {
   
      res.render("placeOrder");
    } catch (error) {
      console.error(error);
      return res.status(500).send("Failed to place the order.");
    }
  },

  showUserOrders: async (req, res) => {
    try {
        const userid = req.session.userid;

        const orders = await Ordercollection.find({ userid: userid }).sort({ orderDate: -1 });

        const Categorie = await Category.find();

        // Iterate through each order
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            console.log("order in show", order);

            // Iterate through each product in the order
            for (let j = 0; j < order.productcollection.length; j++) {
                const product = order.productcollection[j];
                const productid = product.productid;

                // Fetch original price of the product
                let originalPrice = await Product.findById(productid).select("price");
                console.log("originalPrice", originalPrice);
                originalPrice = originalPrice.price;

                // Retrieve product offer
                const productOfferInstance = await ProductOffer.findOne({ productname: product.productName });
                console.log("productOfferInstance is", productOfferInstance);

                // Calculate product discount
                let discountAmount = 0;
                if (productOfferInstance) {
                    const discountPercentage = parseFloat(productOfferInstance.productoffer);
                    discountAmount = (parseFloat(originalPrice) * discountPercentage) / 100;
                }

                // Retrieve category offer
                const categoryOfferInstance = await categoryOffer.findOne({ category: product.Category });
                console.log("categoryOfferInstance is", categoryOfferInstance);

                // Calculate category discount
                if (categoryOfferInstance) {
                    const discountPercentage = parseFloat(categoryOfferInstance.alloffer);
                    const categoryDiscountAmount = (parseFloat(originalPrice) * discountPercentage) / 100;
                    console.log("categoryDiscountAmount is", categoryDiscountAmount);

                    // If the category offer provides a higher discount than the product offer, update discountAmount
                    if (categoryDiscountAmount > discountAmount) {
                        discountAmount = categoryDiscountAmount;
                    }
                }

                // Calculate tax
                const taxRate = 0.03; // 3%
                const taxAmount = parseFloat(originalPrice) * taxRate;

                // Calculate final price including tax
                const productFinalPrice = (parseFloat(originalPrice) * product.quantity) - discountAmount + taxAmount - (order.Discount || 0);
                console.log("order discount is", order.Discount);
                console.log("productFinalPrice is", productFinalPrice);
                console.log("taxAmount is", taxAmount);
                console.log("discountAmount is", discountAmount);

                // Update the product's finalPrice
                product.finalPrice = productFinalPrice;
            }

            // Save the modified order with updated product final prices
            await order.save();
            console.log("order saved with updated final prices", order);
        }

        res.render("userOrders", { Categorie, orders });
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
        "productcollection.productid": productid,
      });

      if (!order) {
        return res.status(404).send("Order not found");
      }

      // Find the specific product within the order
      const product = order.productcollection.find(
        (product) => product.productid.toString() === productid
      );

      console.log(product, "fall");
      if (!product) {
        return res.status(404).send("Product not found in the order");
      }

      // Fetch the billing address associated with the order
      const address = await Address.findOne({ userid: order.userid });

      // Determine payment status based on your logic
      const paymentStatus = order.paymentMethod === "paid"? "paid" : "unpaid";
      console.log(order, "this is the order");

      // Fetch original price of the product
      let originalPrice = await Product.findById(productid).select("price");
      originalPrice = originalPrice.price;
      console.log("originalPrice is ", originalPrice);
  
      const pname = product.productName;

      // Retrieve product offer
      const productOfferInstance = await ProductOffer.findOne({ productname: pname });

      // Calculate product discount
      let discountAmount = 0;
      if (productOfferInstance) {
        const discountPercentage = parseFloat(productOfferInstance.productoffer);
        discountAmount = (parseFloat(originalPrice) * discountPercentage) / 100;
        console.log("discountPercentage issssssssssssss",discountPercentage)
        console.log("discountAmount issssssssssssss",discountAmount)
      }

      // Retrieve category offer
       
      const categoryOfferInstance = await categoryOffer.findOne({ category: product.Category });

      // Calculate category discount
      if (categoryOfferInstance) {
        const discountPercentage = parseFloat(categoryOfferInstance.alloffer);
        const categoryDiscountAmount = (parseFloat(originalPrice) * discountPercentage) / 100;

        // If the category offer provides a higher discount than the product offer, update discountAmount
        if (categoryDiscountAmount > discountAmount) {
          discountAmount = categoryDiscountAmount;
          console.log("discountAmount iss ",discountAmount)

        }
      }

      // Calculate tax
      const taxRate = 0.03; // 3%
      const taxAmount = (parseFloat(originalPrice) ) * taxRate;

      // Calculate final price including tax
      const finalPrice = parseFloat(originalPrice) - discountAmount + taxAmount;
console.log("taxRate iss ",taxRate)

console.log("taxAmount iss ",taxAmount)
console.log("finalPrice iss ",finalPrice)
console.log("discountAmount iss ",typeof(discountAmount))

console.log("taxAmount iss ",typeof(taxAmount))
console.log("originalPrice iss ",typeof(originalPrice))



      res.render("orderDetails", {
        product,
        order,
        address,
        orderid,
        paymentStatus,
        originalPrice,
        discountamount: order.Discount,
        Discount: discountAmount,
        finalPrice: finalPrice.toFixed(2),
        taxAmount: taxAmount.toFixed(2)
        
      });

    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
},


  

cancelOrder: async (req, res) => {
  try {
    const { orderId, productId } = req.params;
const TAX_RATE=0.03;
    // Find the order by ID
    const order = await Ordercollection.findById(orderId);
    if (!order) {
      return res.status(404).send(`Order with ID ${orderId} not found.`);
    }

    // Find the product within the order and update its status to "Cancelled"
    const productIndex = order.productcollection.findIndex(
      (product) => product.productid == productId
    );
    if (productIndex === -1) {
      return res
        .status(404)
        .send(`Product with ID ${productId} not found in order.`);
    }

    const cancelledProduct = order.productcollection[productIndex];

    // Calculate the amount to refund
    let totalRefund = cancelledProduct.price * cancelledProduct.quantity;
    console.log("totalRefund is ",totalRefund);

    // Calculate tax amount and reduce it from the refund
    const taxAmount = totalRefund * TAX_RATE;
    totalRefund += taxAmount;
    console.log("taxAmount is ",taxAmount);
    console.log("TAX_RATE is ",TAX_RATE);


    // If a coupon was applied, reduce the discount from the refund amount
    if (order.Discount > 0) {
      totalRefund -= order.Discount;
    }
console.log("totalRefund is ",totalRefund);
    // If the payment method is Net Banking, update user's wallet and create a refund entry
    if (order.paymentMethod === "Net Banking") {
      const user = await UserCollection.findById(order.userid);
      user.wallet += totalRefund;
      await user.save();

      await wallet.create({
        userid: order.userid,
        date: new Date(),
        amount: totalRefund,
        creditordebit: "credit",
      });

      console.log("Refund processed successfully:", totalRefund);
    }

    // Update product status to "Cancelled"
    cancelledProduct.status = "Cancelled";

    // Save the updated order
    await order.save();

    // Redirect to the page where orders are displayed
    res.redirect("/userOrders");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
},
  

orderReturn: async (req, res) => {
  try {
console.log("entered order return")
    
    const userid = req.params.userid;
    const productid = req.params.productid;
    const selectedstatus = "Returned";
    const idofuser = req.session.userid;
const TAX_RATE=0.03;
    // Retrieve order details
    let order = await Ordercollection.findOne({
      _id: userid,
      "productcollection.productid": productid,
    });
console.log("order is ",order)
    if (!order) {
      return res.status(404).send("Order not found");
    }

    const product = order.productcollection.find(
      (product) => product.productid.toString() === productid
    );
console.log("product is ",product)

    if (!product) {
      return res.status(404).send("Product not found in the order");
    }

    const { price, quantity,proffer} = product;
    console.log("price is ",price)
    console.log("quantity is ",quantity)
    console.log("product is ",product)

    // Calculate the amount to refund
    let tr=proffer/quantity
    let tr1=tr+price

    console.log('tr pric is',tr)
    console.log('tr1 pric is',tr1)
    console.log('tr pric is',price)
    console.log('proffer  is',proffer)
  
    let Refund = tr1*quantity;
    totalRefund=Refund-proffer
    console.log("totalRefund is ",totalRefund)

    // Check if a coupon was applied to the order
    if (order.Discount > 0) {
      totalRefund -= order.Discount;
    }
    console.log("order.Discount is ",order.Discount)

    // Update order status to 'Returned'
    await Ordercollection.updateOne(
      { userid: userid, "productcollection.productid": productid },
      { $set: { "productcollection.$.status": selectedstatus } }
    );

    // Add stock back to the Product database
    await Product.findOneAndUpdate(
      { _id: productid },
      { $inc: { Stock: quantity } }
    );

    if (order.paymentMethod === "Net Banking" || order.paymentMethod === "Cash on Delivery") {
      // Calculate tax amount and reduce it from the refund
      const taxAmount = totalRefund * TAX_RATE;
      totalRefund += taxAmount;
      console.log("taxAmount",taxAmount)
      console.log("totalRefund is ",totalRefund)
      console.log("TAX_RATE is",TAX_RATE)

      // Update user's wallet and create a refund entry
      let userorder = await UserCollection.findOneAndUpdate(
        { _id: idofuser },
        { $inc: { wallet: totalRefund } }
      );

      await wallet.create({
        userid: idofuser,
        date: new Date(),
        amount: totalRefund,
        creditordebit: "credit",
      });
    }

    product.status = selectedstatus;
    console.log("product.status is",product.status)

    // Save the updated order to the database
    await order.save();
    res.redirect("/userOrders");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error returning order" });
  }
},





Invoice: async (req, res) => {
  try {
      let userId = req.session.userid;
      console.log(userId);
      const orderId = req.params.orderid;
      console.log("Entered", orderId);

      const invoiceDetails = await UserCollection.findOne({ _id: userId });
      console.log("Invoice", invoiceDetails);

      const specificOrder = await Ordercollection.findById(orderId);
      if (!specificOrder) {
          console.error(`Order not found for ID: ${orderId}`);
          return res.status(404).render("error", { message: "Order not found." });
      }
      console.log("Invoiceu", specificOrder);

      // Create a new PDF document
      const doc = new PDFDocument();

      // Set response headers to trigger a download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="invoice.pdf"');
      // Pipe the PDF document to the response
      doc.pipe(res);
      console.log("hello ask1");
      const imagePath = "public/images/logo.png"; // Change this to the path of your image
      const imageWidth = 100; // Adjust image width based on your layout
      const imageX = 550 - imageWidth; // Adjust X-coordinate based on your layout
      const imageY = 50; // Adjust Y-coordinate to place the image at the top
      doc.image(imagePath, imageX, imageY, { width: imageWidth });
      // Move to the next section after the image
      doc.moveDown(1);
      // Add content to the PDF document
      doc.fontSize(16).text("Billing Details", { align: "center" });
      doc.moveDown(1.2);
      doc.fontSize(10).text("Customer Details", { align: "center" });
      doc.moveDown(1);
      doc.text(`Order ID: ${orderId}`);

      doc.moveDown(0.3);
      doc.text(`Name: ${invoiceDetails.username || ""}`);
      doc.moveDown(0.3);
      doc.text(`Email: ${invoiceDetails.email || ""}`);

      console.log("hello ask6");

      if (specificOrder.address) {
          const address = specificOrder.address;
          doc.moveDown(0.3);
          doc.text(
              `Address: ${address.address}, ${address.city}, ${address.state} ${address.pincode || ""
              }`
          );
      } else {
          console.warn(`Address not found for order ID: ${orderId}`);
      }

      doc.moveDown(0.3);
      doc.text(`Payment Method: ${specificOrder.paymentMethod || ""}`);
      console.log("hello ask2");
      doc.moveDown(0.3);
      console.log("In");
      const headerY = 300; // Adjust this value based on your layout
      doc.font("Helvetica-Bold");
      doc.text("Name", 100, headerY, { width: 150, lineGap: 5 });
      doc.text("Status", 300, headerY, { width: 150, lineGap: 5 });
      doc.text("Quantity", 400, headerY, { width: 50, lineGap: 5 });
      doc.text("Price", 500, headerY, { width: 50, lineGap: 5 });
      doc.font("Helvetica");

      // Table rows
      const contentStartY = headerY + 30; // Adjust this value based on your layout
      let currentY = contentStartY;
      specificOrder.productcollection.forEach((product, index) => {
          doc.text(product.productName || "", 100, currentY, {
              width: 150,
              lineGap: 5,
          });

          doc.text(product.status || "", 300, currentY, {
              width: 50,
              lineGap: 5,
          });
          doc.text(product.quantity || "", 400, currentY, {
              width: 50,
              lineGap: 5,
          });

          doc.text(product.price || "", 500, currentY, {
              width: 50,
              lineGap: 5,
          });
          console.log("Reached Here");

          // Calculate the height of the current row and add some padding
          const lineHeight = Math.max(
              doc.heightOfString(product.productName || "", { width: 150 }),
              doc.heightOfString(product.status || "", { width: 150 }),

              doc.heightOfString(product.price || "", { width: 50 })
          );
          currentY += lineHeight + 10; // Adjust this value based on your layout
      });
      console.log("Reached Here2");
      doc.text(`Total Price: ${specificOrder.totalPrice || ""}`, {
          width: 400, // Adjust the width based on your layout
          lineGap: 5,
      });

      // Set the y-coordinate for the "Thank you" section
      const separation = 50; // Adjust this value based on your layout
      const thankYouStartY = currentY + separation; // Update this line

      // Move to the next section
      doc.y = thankYouStartY; // Change this line

      // Move the text content in the x-axis
      const textX = 60;
      const textWidth = 500;
      doc.fontSize(14).text(
          "Thank you for choosing RED STORE! We appreciate your support and are excited to have you as part of our family.",
          textX,
          doc.y,
          { align: "center", width: textWidth, lineGap: 10 }
      );

      doc.end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error returning order" });
  }
},



};
