const express = require("express");
const bcryptjs = require("bcryptjs");
const Product = require("../model/product");
const WishList = require("../model/wishlist");
const Category = require("../model/category");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const UserCollection = require("../model/users");
const Wallet = require("../model/wallet");
const Ordercollection = require("../model/order");


//!google


const googleuser = async (req, res) => {
  try {
    console.log('google user',req.user);
    req.session.userid=req.user._id
    console.log('session is',req.session.userid);
    res.redirect('/homepage')
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to cancel order by user." });
  }
};

//!guest homepage
const guestHomepage = async (req, res) => {
  try {
    if (req.session.userid) {
      res.redirect("/homepage");
    }
    const productcollection = await Product.find({
      isListed: true,
      stock: { $gt: 1 },
    }).limit(4);
    res.render("guestHomepage", { productcollection });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

//!login render
const userlogin = (req, res) => {
  if (req.session.userid) {
    res.redirect("/homepage");
  } else {
    res.render("userlogin", { message: null });
  }
};

//!userloginpost
const userloginpost = async (req, res) => {
  const { Email, password } = req.body;

  try {
    const user = await UserCollection.findOne({ email: Email });

    if (!user) {
      console.log("User not found");
      // Handle case where user is not found (e.g., show error message)
      res.render("userlogin", { message: "Invalid email or password" });
      return;
    }

    if (user.isblocked) {
      console.log("User is blocked");
      // Handle case where user is blocked (e.g., show error message)
      res.render("userlogin", {
        message: "Your account is blocked. Please contact the administrator.",
      });
      return;
    }

    const validPassword = bcryptjs.compareSync(password, user.password);

    if (validPassword) {
      req.session.userid = user._id;
      console.log("here");
      console.log(req.session.userid);
      res.redirect("/homepage"); // Redirect to home page if user is found and password is valid
    } else {
      console.log("Invalid email or password");
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
  res.render("usersignup", { errorMessage: null });
};

//!otp
const otps = (req, res) => {
  res.render("otp");
};

// Function to generate a referral code
const generateReferralCode = (length) => {
  const characters =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let referralCode = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    referralCode += characters[randomIndex];
  }

  return referralCode;
};

let email;
let otp;
let signupdata;
let referral;
let referredUser;
let referred = "false";
//!signup post
const usersignuppost = async (req, res) => {
  try {
    console.log('here the controller');
    if (!req.body) {
      console.log("herr teh  ");
      return res.render("usersignup", {
        errorMessage: "Enter the field Properly",
      });
    }

    const existingUser = await UserCollection.findOne({
      email: req.body.email,
    });

    if (existingUser) {
      return res.render("usersignup", { errorMessage: "Email already exists" });
    }
    // If the email is unique, proceed with creating a new user
    const hashedPassword = bcryptjs.hashSync(req.body.password, 10);

    const referralCode = generateReferralCode(8); // Change the length as needed
    console.log("referralCode", referralCode);

    if (req.body.referralcode) {
      referral = req.body.referralcode;
      referredUser = await UserCollection.findOne({ referralcode: referral });
      console.log("referredUserssssssssss", referredUser);
      console.log("referralllllllllll", referral);

      if (referredUser) {
        referred = "true";
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Referral code not found" });
      }
    }

    signupdata = {
      username: req.body.username,
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPassword,
      referralcode: referralCode,
      wallet: referredUser ? 50 : 0,
    };
    email = req.body.email;
    otp = generateRandomString(6);
    // req.session.Otp = otp
    console.log("OTP generated", otp);

    // Assuming sendOtpEmail and generateRandomString are defined elsewhere
    await sendOtpEmail(email, otp);

    // Redirect to the OTP verification page
    return res.redirect("/otp");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

//!otp generation

const sendOtpEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ADDRESS, //  email address
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: "",
      to: email,
      subject: "One-Time Password (OTP) for Authentication",
      text: ` Your Authentication OTP is: ${otp}`,
    };
    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        return console.error("Error:", error);
      }
      console.log("Email sent:", info.response);
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};
//!otp generate
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
      if (referred === "true") {
        await UserCollection.updateOne(
          { referralcode: referral },
          { $inc: { wallet: 100 } }
        );
        console.log("Wallet updated");
      }

      const wallet = new Wallet({
        userid: newUser._id, // Assign the newly created user's _id to the userid field
        date: new Date(), // Assign the current date
        amount: 0, // Default amount
        creditordebit: "", // Default creditordebit
      });

      await wallet.save();

      res.status(200).json({ success: true, redirect: "/" });
    } else {
      res.status(400).json({ success: false, message: "Invalid entry" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//!resend otp
const resendotp = async (req, res) => {
  try {
    otp = generateRandomString(6);
    console.log("otp generated", otp);
    await sendOtpEmail(email, otp);

    res.redirect("/otp");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};




                                                            //!/FORGOT PASSWORD  START  /////////



//! forgot password get which needs to enter email

const forgotPasswordEmail=async(req,res)=>{
  res.render('forgotPasswordEmail',{ error: null, email: null })
}



//! after email is entered and to check 

const forgotPasswordEmailpost= async (req, res) => {
  const userEmail = req.body.email;
  req.session.email = userEmail

  console.log("THE EMAIL IS",req.session.email);


  try {
      const user = await UserCollection.findOne({ email: userEmail });

      if (user) {
        req.session.Otp  = generateRandomStrings(6);
        const otp =req.session.Otp;
        console.log("THE REQUIRED OTP IS:" ,otp);
          await sendOtpEmails(req.body.email, otp);
          res.redirect('/forgotPasswordOtp');
      } else {
        res.render('forgotPasswordEmail', {
          error: 'User with this email does not exist',
          email: userEmail,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };




//!genetrate otp for the forgot password


const generateRandomStrings = (length) => {
  const digits = "0123456789";
  let OTP = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    OTP += digits[randomIndex];
  }

  return OTP;
  

};



//!otp send to email for the forgot password


const sendOtpEmails = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ADDRESS, //  email address
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: "",
      to: email,
      subject: "One-Time Password (OTP) for Authentication",
      text: ` Your Authentication OTP is: ${otp}`,
    };
    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        return console.error("Error:", error);
      }
      console.log("Email sent:", info.response);
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};




//! enter otp for the forgot password

const forgotPasswordOtp = async(req,res)=>{
  const enteredOtps = req.body.otp;
  res.render('forgotPasswordOtp',{ enteredOtps })
}   



//! otp post for forgot password

const forgotPasswordOtppost = async(req,res)=>{
  const enteredOtps =  req.body.otp;
const otp = req.session.Otp  
console.log("THE ENTERED OTP IS ",enteredOtps);
console.log('OTP :',otp)
  if (otp === enteredOtps) {

       res.redirect('/forgotPasswordConfirm');
 
  } else { 
    const errorMessage = 'Invalid OTP. Please try again.';
    res.render('forgotPasswordOtp', { enteredOtps, otp, errorMessage });
  }
};



//!resend otp for the forgot password

const resendOtps = async (req, res) => {
  req.session.Otp  = generateRandomStrings(6);
  const otp =req.session.Otp;
  const userEmail = req.body.email;  
  await sendOtpEmails(userEmail, otp);
    res.redirect('/forgotPasswordOtp')
    // Send a success status
};






//! add new password and comfrm password

const forgotPasswordConfirm=async(req,res)=>{
  res.render('forgotPasswordConfirm', { errors: {} })
}



//! update password and sucessfully change the passeword

const updatePassword = async (req, res) => {
  const userEmail = req.session.email;
  const newPassword = req.body.newPassword;
  const confirmPassword = req.body.confirmPassword;

  // Validation checks
  const errors = {};

  // Null and whitespace validation
  if (!newPassword || !confirmPassword || newPassword.trim() === '' || confirmPassword.trim() === '') {
      errors.newPassword = 'Password cannot be empty';
      errors.confirmPassword = 'Confirm Password cannot be empty';
  }

  // Strong password validation (you can customize this based on your requirements)
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
  if (!passwordRegex.test(newPassword)) {
      errors.newPassword = 'Password must be at least 8 characters long and include at least one digit, one lowercase letter, one uppercase letter, and one special character.';
  }

  // Check if passwords match
  if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
  }

  try {
      if (Object.keys(errors).length === 0) {
          const userdetails = await UserCollection.findOne({ email: userEmail });

          if (userdetails) {

            const hashedPassword = await bcryptjs.hash(newPassword, 10); // 10 is the saltRounds
              // Update the user's password
              userdetails.password = hashedPassword;
              await userdetails.save();

              res.redirect('/userlogin');
          } else {
              res.render('forgotPasswordConfirm', { errors: { newPassword: 'User not found' } });
          }
      } else {
          res.render('forgotPasswordConfirm', { errors });
      }
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
};

                                                            //!/FORGOT PASSWORD  END  /////////





//! homepage  get
const Homepage = async (req, res) => {
  try {
    const productcollection = await Product.find({
      isListed: true,
      stock: { $gt: 1 },
    }).limit(4);
    res.render("Homepage", { productcollection });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

//!product detail page get


const productDetails = async (req, res) => {
  try {
    console.log(" got into productDetails")
    const productId = req.params.id;
    const userId = req.session.userid;
    console.log("productId:", productId);
    console.log("userId:", userId);

    // Fetch the product details
    const product = await Product.findById(productId);
    if (!product) return res.status(404).send("Product not found");

    // Check if the product is in the user's wishlist
    let isInWishlist = false;
    if (userId) {
      const wishlistItem = await WishList.findOne({ userid: userId, productid: productId });
      isInWishlist = !!wishlistItem;
      console.log("wishlistItem:", wishlistItem);
      console.log("isInWishlist:", isInWishlist);
    }

    // Pass the product and isInWishlist to the template
    res.render("productDetails", { product, isInWishlist });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};


const allProducts = async (req, res) => {
  try {
    const PAGE_SIZE = 4; // Number of products per page
    let { page, sortprice, sortAlphabetically, category, priceRange } =
      req.query;
    page = parseInt(page) || 1; // Get current page from query parameters, default to 1 if not provided

    if (req.session.userid) {
      const totalCount = await Product.countDocuments(
        buildQuery(category, priceRange)
      ); // Use helper function to build query
      const totalPages = Math.ceil(totalCount / PAGE_SIZE);

      // Fetch products with sorting and pagination
      const productcollection = await Product.find({
        ...buildQuery(category, priceRange),
        stock: { $gte: 0 }, // Filter out products with stock 0
      })
        .sort(buildSortOption(sortprice, sortAlphabetically))
        .skip((page - 1) * PAGE_SIZE) // Skip products based on current page
        .limit(PAGE_SIZE); // Limit number of products per page

      const categories = await Category.find();
      res.render("allProducts", {
        categories,
        productcollection,
        totalPages,
        currentPage: page,
        sortprice,
        sortAlphabetically,
        category,
        priceRange,
      });
    } else {
      res.redirect("/allProducts");
    }
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Helper function to build query based on filter parameters
const buildQuery = (category, priceRange) => {
  let query = { isListed: true, stock: { $gt: 1 } };
  if (category && category !== "All Categories") {
    query.category = category;
  }
  if (priceRange && priceRange !== "All Prices") {
    const [minPrice, maxPrice] = priceRange.split("-").map(Number);
    query.price = { $gte: minPrice, $lte: maxPrice };
  }
  return query;
};

// Helper function to build sort option based on filter parameters
const buildSortOption = (sortprice, sortAlphabetically) => {
  let sortOption = {};
  if (sortprice === "lowToHigh") {
    sortOption.price = 1; // Sort by ascending price
  } else if (sortprice === "highToLow") {
    sortOption.price = -1; // Sort by descending price
  }
  if (sortAlphabetically === "ascending") {
    sortOption.productname = 1; // Sort by ascending alphabetical order of product names
  } else if (sortAlphabetically === "descending") {
    sortOption.productname = -1; // Sort by descending alphabetical order of product names
  }
  return sortOption;
};

//!wishlist

const wishList = async (req, res) => {
  try {
    const userid = req.session.userid;
    const productid = req.params.productid;
    console.log("userid:", userid);
    console.log("productidddddddddd", productid);

    const Wishlist = await WishList.find({ userid: userid });
    const Categorie = await Category.find();

    const isEmpty = Wishlist.length === 0;
    res.render("wishList", { Wishlist, Categorie, isEmpty });
    console.log("Wishlist", Wishlist);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal wishlist page  Error");
  }
};

//! add item to wishlist
const addToWishlist = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.session.userid;
    console.log("postuserid:", userId);

    //  product exists
    const product = await Product.findById(productId);
    if (!product) return res.status(404).send("Product not found");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
    // user exists
    const user = await UserCollection.findById(userId);
    if (!user) return res.status(404).send("User not found");

    // Check  the product  already in  wishlist
    const existingWishlistItem = await WishList.findOne({
      userid: userId,
      productid: productId,
    });

    if (existingWishlistItem) return res.redirect("/Homepage");

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
    res.redirect("/wishList");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

//!remove item from Wishlist

const removewishlist = async (req, res) => {
  try {
    const wishlistitem = req.params.id;
    await WishList.findByIdAndDelete(wishlistitem);
    res.redirect("/wishList");
  } catch (error) {
    console.log(error);
    res.status(500).send("delete wishlist Error");
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
};

const getwallet = async (req, res) => {
  try {
    const Userid = req.session.userid;
    const userdet = await UserCollection.findById(Userid);
    const walletdetails = await Wallet.find({ userid: Userid }).sort({
      date: -1,
    });

    console.log("id of the user is ", Userid);

    console.log("wallet of the user is ", walletdetails);

    res.render("wallet", { userdet, walletdetails });
  } catch (err) {
    console.error(err);

    return res.status(500).json({ error: "Failed to cancel order by user." });
  }
};

const searchProducts = async (req, res) => {
  try {
    const { searchedInput, page = 1 } = req.body;
    const regexPattern = new RegExp(searchedInput, 'i');
    const itemsPerPage = 4; // Adjust as needed

    const totalProducts = await Product.countDocuments({ productname: { $regex: regexPattern } });
    const allSearchedProducts = await Product.find({ productname: { $regex: regexPattern } })
                                             .skip((page - 1) * itemsPerPage)
                                             .limit(itemsPerPage);

    const totalPages = Math.ceil(totalProducts / itemsPerPage);

    console.log("fetched searched products", allSearchedProducts);
    return res.json({
      products: allSearchedProducts,
      totalPages: totalPages,
      currentPage: page
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch searched products by user." });
  }
}

// //!google login post


module.exports = {

  googleuser,

  guestHomepage,
  userlogin,
  userloginpost,
  usersignup,
  otps,
  otppost,
  resendotp,

  forgotPasswordEmail,
  forgotPasswordEmailpost,
  resendOtps,
  forgotPasswordOtp,
  forgotPasswordOtppost,
  forgotPasswordConfirm,
  updatePassword,



  usersignuppost,
  Homepage,
  productDetails,
  allProducts,
  getLogout,
  wishList,
  addToWishlist,
  removewishlist,
  getwallet,

  searchProducts,
  
};
