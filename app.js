const express = require("express");
const path = require("path");
const morgan = require('morgan');
const nocache = require('nocache');
const session = require('express-session');
const mongoose = require("../sksproject/server");
const adminrouter = require('./routes/adminrouter');
const userrouter = require("./routes/userrouter");
const cartrouter=require("./routes/cartRouter")
const orderrouter= require("./routes/orderRouter")
const productController = require('./routes/productrouter');
const userProfilerouter = require("./routes/userProfilerouter")
const Coupondetails = require('./routes/couponRouter');
const app = express();

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



// Routes setup
app.use("/", userrouter);
app.use("/admin", adminrouter);
app.use("/admin", productController);
app.use("/",userProfilerouter)
app.use("/",cartrouter)
app.use("/",orderrouter)
app.use('/',Coupondetails);



// Serving static assets
app.use(express.static(path.join(__dirname, 'public')));
// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
