const express=require("express")
const router=express.Router()

const usercontroller=require("../controller/usercontroller")
const productController = require("../controller/productController");

const checkSessionBlocked = require('../Middleware/user')



//!user guest page

router.get("/",usercontroller.guestHomepage)


//!product detail page
router.get("/productDetails",checkSessionBlocked,  usercontroller.productDetails);

//!all products page
router.get("/allProducts",checkSessionBlocked,  usercontroller.allProducts);

//!filter in all product page
router.post('/filter',productController.productfilter);



//!userlogin page
router.get("/userlogin",usercontroller.userlogin)
router.post("/userloginpost",usercontroller.userloginpost)

//!usersignupp page

router.get("/usersignup",usercontroller.usersignup)
router.post("/usersignuppost",usercontroller.usersignuppost)


//!otp page

router.get("/otp",usercontroller.otps)
router.post("/otppost",usercontroller.otppost)
router.get('/resendotp', usercontroller.resendotp)


//!main page

router.get("/homepage",checkSessionBlocked,usercontroller.Homepage)

router.get("/productcollection/:id",checkSessionBlocked,usercontroller.Homepage)


//!wishlist page

router.get("/wishlist",checkSessionBlocked,usercontroller.wishList)
router.get("/Wishlist/:id",checkSessionBlocked,usercontroller.addToWishlist);
router.get("/removeFromWishlist/:id",checkSessionBlocked,usercontroller.removewishlist);

//!wallet
router.get("/wallet",checkSessionBlocked,usercontroller.getwallet);


//!google

//router.post("/googleLogin",usercontroller.googleloginpost )





router.get("/logout",usercontroller.getLogout)










module.exports=router

