const express = require("express");
const router = express.Router();
const nocache = require("nocache");
const path = require('path')
const multer = require("multer");
const checkSessionBlocked = require('../Middleware/user')
const profilecontroller= require('../controller/profilecontroller')

router.use(nocache());



const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'public/profilleimages')
    },
    filename: function(req,file,cb){
        const uniquieSuffix = Date.now()+'-'+Math.round(math.random()*1E9)
        cb(null,file.fieldname+ '-' + uniquieSuffix+path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage })

const checkSessionAndBlocked = async (req, res, next) => {
    if (req.session.userid) {
      const userDetials = await users.findOne({ _id: req.session.userid });
      if (!userDetials.isblocked) {
        // User is not blocked, proceed to the next middleware or route handler
        next();
      } else {
        // User is blocked, destroy the session and redirect
        req.session.destroy((err) => {
          if (err) {
            console.log("Error destroying session: ", err);
            res.redirect("/");
          } else {
            res.redirect("/");
          }
        });
      }
    } else {
      // No userId in session, redirect to the default page
      res.redirect("/");
    }
  };






  
  //!user profile get
  router.get("/userProfile",checkSessionBlocked,profilecontroller.showUserUi)

//!user profile edit  get and post
router.get("/editProfile",profilecontroller.editProfileGet)
router.post("/updateProfile",profilecontroller.editProfilePost)


//!user change password get and post

router.get("/changePassword",profilecontroller.changePasswordGet)
router.post("/changePassword",profilecontroller.changePasswordPost)



//! user address

router.get("/userAddress",checkSessionBlocked,profilecontroller.showUserAddress);


//! add address 

router.get("/addAddress",checkSessionBlocked,profilecontroller.addAddress)
router.post("/addAddress",profilecontroller.addAddresspost)

// //!edit address get
//  router.get('/editAddress',profilecontroller.editAddressget)
//  router.post('/editAddress/:id', profilecontroller.editAddressPost);
router.get('/editAddress/:id',checkSessionBlocked,profilecontroller.editAddressget)
router.post('/editAddress/:id',profilecontroller.editAddresspost)




//!delete address

 router.get("/deleteAddress/:id",profilecontroller.deleteAddressget)

  
module.exports=router
