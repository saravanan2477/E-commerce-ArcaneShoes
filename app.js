const express = require("express");
const path = require("path");
const morgan = require('morgan');
const nocache = require('nocache');
const session = require('express-session');
const mongoose = require("./server");
const adminrouter = require('./routes/adminrouter');
const userrouter = require("./routes/userrouter");
const cartrouter=require("./routes/cartRouter")
const orderrouter= require("./routes/orderRouter")
const productController = require('./routes/productrouter');
const userProfilerouter = require("./routes/userProfilerouter")
const Coupondetails = require('./routes/couponRouter');
const paymentRoute = require('./routes/paymentRouter');
const salesController=require('./routes/salesRouter');
const Swal = require('sweetalert2')
const app = express();
const passport =require('passport')


app.use('/public/', express.static('./public'));


app.use(nocache());
const port = process.env.PORT || 3000;
require('dotenv').config();
const crypto = require('crypto');
const profilecontroller = require("./controller/profilecontroller");
const secret = crypto.randomBytes(32).toString('hex');

// Routes
app.use(session({
  secret: secret,
  resave: false,
  saveUninitialized: true,
}));

// Bodyparser setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("tiny"));


// View engine setup
app.set("view engine", "ejs");

//load the passport configuration
require('./auth/passport')

//setup the passport sesion and initialization
app.use(passport.initialize());
app.use(passport.session());



// Routes setup
app.use("/", userrouter);
app.use("/admin", adminrouter);
app.use("/", productController);
app.use("/",userProfilerouter)
app.use("/",cartrouter)
app.use("/",orderrouter)
app.use("/",Coupondetails);
app.use("/",paymentRoute);
app.use("/",salesController);


// Serving static assets
app.use(express.static(path.join(__dirname, 'public')));


// 404 error handler for user routes
app.use(function(req, res, next) {
  if (req.originalUrl.startsWith('/admin')) {
    next();
  } else {
    res.status(404).render('error404'); // Assuming you have a user-404.ejs template
  }
});

// 404 error handler for admin routes
app.use('/admin/*', function(req, res) {
  res.status(404).render('adminerror404'); // Assuming you have an admin-404.ejs template
});

// Error-handling middleware
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  console.log(err);
  res.render('error404');
});


// Start server
app.listen(port, (err) => {
  if (!err) {
  console.log(`Server is running on http://localhost:${port}`);
  }
  else{
  console.log(err);
  }

});
