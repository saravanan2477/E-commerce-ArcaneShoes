const express = require("express")
const bcryptjs = require("bcryptjs")
const Product = require("../model/product");
const WishList= require("../model/wishlist")
const Category = require("../model/category");

const crypto = require("crypto")
const nodemailer = require('nodemailer')

const UserCollection = require("../model/users");



//!guest homepage
const guestHomepage = async (req, res) => {
  try {
    if (req.session.userid) {
      res.redirect('/homepage')
    } 
    const productcollection = await Product.find({ isListed: true, stock: { $gt: 1 } }).limit(4)
    res.render('guestHomepage', { productcollection });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal Server Error");
  }
}



//!login render
const userlogin = (req, res) => {
  if (req.session.userid) {
    res.redirect('/homepage')
  } else {
    res.render("userlogin", { message: null })
  }
}

//!userloginpost
const userloginpost = async (req, res) => {
  const { Email, password } = req.body;

  try {
    const user = await UserCollection.findOne({ email: Email });

    if (!user) {
      console.log('User not found');
      // Handle case where user is not found (e.g., show error message)
      res.render("userlogin", { message: "Invalid email or password" });
      return;
    }

    if (user.isblocked) {
      console.log('User is blocked');
      // Handle case where user is blocked (e.g., show error message)
      res.render("userlogin", { message: "Your account is blocked. Please contact the administrator." });
      return;
    }

    const validPassword = bcryptjs.compareSync(password, user.password);

    if (validPassword) {
      req.session.userid=user._id
      console.log('here');
      console.log( req.session.userid);
      res.redirect("/homepage"); // Redirect to home page if user is found and password is valid
    } else {
      console.log('Invalid email or password');
      // Handle invalid email or password (e.g., show error message)
      res.render("userlogin", { message: "Invalid email or password" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};


//!user signiup render
const usersignup = (req, res) => {
  res.render("usersignup")
}



//!otp
const otps = (req, res) => {
  res.render("otp")
}

let email
let otp
let signupdata

//!signup post
const usersignuppost = async (req, res) => {
  try {

    const existingUser = await UserCollection.findOne({ email: req.body.email });

    if (existingUser) {

      return res.render('usersignup', { errorMessage: 'Email already exists' });
    }
    // If the email is unique, proceed with creating a new user
    const hashedPassword = bcryptjs.hashSync(req.body.password, 10);
    signupdata = {
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    };
    email = req.body.email;
    otp = generateRandomString(6);
    // req.session.Otp = otp
    console.log('OTP generated', otp);

    // Assuming sendOtpEmail and generateRandomString are defined elsewhere
    await sendOtpEmail(email, otp);

    // Redirect to the OTP verification page
    return res.redirect('/otp');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
};


//!otp generation

const sendOtpEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ADDRESS, //  email address
        pass: process.env.EMAIL_PASSWORD
      }
    });
    const mailOptions = {
      from: '',
      to: email,
      subject: 'One-Time Password (OTP) for Authentication',
      text: ` Your Authentication OTP is: ${otp}`
    };
    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        return console.error('Error:', error);
      }
      console.log('Email sent:', info.response);
    });

  } catch (error) {
    console.log(error)
    return res.status(500).send("Internal Server Error");

  }
};
//otp ganarate
const generateRandomString = (length) => {
  const digits = "0123456789";
  let OTP = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    OTP += digits[randomIndex];
  }
  return OTP;
};


//!otp post 
const otppost = async (req, res) => {
  try {
    const digit = req.body.otp;
    const otpnumber = digit;
    console.log("Number is " + otpnumber);

    if (otp === otpnumber) {
      const newUser = new UserCollection(signupdata);
      await newUser.save();


      res.status(200).json({ success: true, redirect: '/' });
    } else {
      res.status(400).json({ success: false, message: "Invalid entry" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

//resend otp
const resendotp = async (req, res) => {
  try {
    otp = generateRandomString(6);
    console.log('otp generated', otp);
    await sendOtpEmail(email, otp);

    res.redirect('/otp')
  } catch (error) {
    console.log(error)
    return res.status(500).send("Internal Server Error");
  }
}

//! homepage  get
const Homepage = async (req, res) => {
  try {

    
      const productcollection = await Product.find({ isListed: true, stock: { $gt: 1 } }).limit(4);
      res.render('Homepage', { productcollection });


  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal Server Error");
  }
}



//!product detail page get

const productDetails = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log("productId", productId);
    const productView = await Product.findById(productId)
    res.render('productDetails');
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal Server Error");
  }
}

//!all products page get
// const allProducts = async (req, res) => {
//   try {

//     res.render('allProducts');
//   } catch (error) {
//     console.log("Error:", error);
//     res.status(500).send("Internal Server Error");
//   }
// }
const allProducts = async (req, res) => {
  try {
    const PAGE_SIZE = 4; // Number of products per page
    let { page, sortprice, sortAlphabetically, category, priceRange } = req.query;
    page = parseInt(page) || 1; // Get current page from query parameters, default to 1 if not provided

    if (req.session.userid) {
      const totalCount = await Product.countDocuments(buildQuery(category, priceRange)); // Use helper function to build query
      const totalPages = Math.ceil(totalCount / PAGE_SIZE);

      // Fetch products with sorting and pagination
      const productcollection = await Product.find(buildQuery(category, priceRange))
        .sort(buildSortOption(sortprice, sortAlphabetically))
        .skip((page - 1) * PAGE_SIZE) // Skip products based on current page
        .limit(PAGE_SIZE); // Limit number of products per page
      
      res.render('allProducts', { productcollection, totalPages, currentPage: page, sortprice, sortAlphabetically, category, priceRange });
    } else {
      res.redirect('/allProducts');
    }
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal Server Error");
  }
}

// Helper function to build query based on filter parameters
const buildQuery = (category, priceRange) => {
  let query = { isListed: true, stock: { $gt: 1 } };
  if (category && category !== 'All Categories') {
    query.category = category;
  }
  if (priceRange && priceRange !== 'All Prices') {
    const [minPrice, maxPrice] = priceRange.split('-').map(Number);
    query.price = { $gte: minPrice, $lte: maxPrice };
  }
  return query;
}

// Helper function to build sort option based on filter parameters
const buildSortOption = (sortprice, sortAlphabetically) => {
  let sortOption = {};
  if (sortprice === 'lowToHigh') {
    sortOption.price = 1; // Sort by ascending price
  } else if (sortprice === 'highToLow') {
    sortOption.price = -1; // Sort by descending price
  }
  if (sortAlphabetically === 'ascending') {
    sortOption.productname = 1; // Sort by ascending alphabetical order of product names
  } else if (sortAlphabetically === 'descending') {
    sortOption.productname = -1; // Sort by descending alphabetical order of product names
  }
  return sortOption;
}





//!wishlist 

const wishList=async(req,res)=>{

  
  try{
    
    const userid=req.session.userid;
    const productid = req.params.productid;
    console.log("userid:",userid);
    console.log("productidddddddddd", productid);

    const Wishlist=await WishList.find({userid:userid })
    const Categorie = await Category.find( ); 

    const isEmpty = Wishlist.length === 0;
    res.render('wishList',{Wishlist,Categorie,isEmpty });
    console.log("Wishlist",Wishlist);

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal wishlist page  Error');
}

}

//! add item to wishlist
const addToWishlist = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.session.userid;
    console.log("postuserid:", userId);

    //  product exists
    const product = await Product.findById(productId);
   if (!product) return res.status(404).send('Product not found');

    // user exists
    const user = await UserCollection.findById(userId);
    if (!user) return res.status(404).send('User not found');

    // Check  the product  already in  wishlist
    const existingWishlistItem = await WishList.findOne({ userid: userId, productid: productId });

    if (existingWishlistItem) return res.redirect('/Homepage');

    // Create a new wishlist item
    const newWishlistItem = {
      userid: userId,
      username: user.username,
      productid: productId,
      product: product.productname,
      price: product.price,
      image: product.image[0],
    };

    
    await WishList.create(newWishlistItem);

    console.log("Wishlist item added:", newWishlistItem);
    res.redirect('/Homepage');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


//!remove item from Wishlist

const removewishlist=async(req,res)=>{
  try{
    const wishlistitem = req.params.id;
    await WishList.findByIdAndDelete(wishlistitem)
    res.redirect('/wishList')
  }catch (error) {
    console.log(error);
    res.status(500).send('delete wishlist Error');
    }
     };




     //!logoout

const getLogout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log("Error distroying session: ", err);
      } else {
        res.redirect("/");
      }
    });
  } catch (err) {
    console.error("Error in getLogout:", err);
    res.status(500).send("Error occurred during logout. Please try again.");
  }
}










// //!google login post

// const googleloginpost = (req,res)=>{
//   console.log("he;llo world");
//   let token = req.body.token;

//   async function verify() {
//       const ticket = await client.verifyIdToken({
//           idToken: token,
//           audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
//       });
//       const payload = ticket.getPayload();
//       const userid = payload['sub'];
//     }
//     verify()
//     .then(()=>{
//         res.cookie('session-token', token);
//         res.send('success')
//     })
//     .catch(console.error);

// }






module.exports = {
  guestHomepage,
  userlogin,
  userloginpost,
  usersignup,
  otps,
  otppost,
  resendotp,
  usersignuppost,
  Homepage,
  productDetails,
  allProducts,
  getLogout,
  wishList,
  addToWishlist,
  removewishlist
  // googleloginpost
}
