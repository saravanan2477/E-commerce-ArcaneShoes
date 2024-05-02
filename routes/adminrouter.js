const express=require("express")
const router=express.Router()
const admincontroller=require("../controller/adminController")
const nocache = require("nocache");
// const path = require('path')
const multer = require("multer");
router.use(nocache());






const checkSession = async (req, res, next) => {
    console.log("Reached the checkSession")
    if (req.session.admin) { 
      console.log("session found")
      next();
    } else {
      // No userId in session, redirect to the default page
      res.redirect("/admin/adminlogin");
     console.log("No session is found ")
    }
  };
  


// const session = require('express-session');

//admin login page//
router.get("/adminlogin",admincontroller.adminlogin)
router.post("/adminloginpost",admincontroller.adminloginpost)

//admin dashboard//                                                                                                                                                                                                                                                                                                                                
router.get("/dashboard",checkSession,admincontroller.dashboard)


//user management
router.get("/usermanagement",checkSession,admincontroller.usermanagement)
router.post("/usermanagement",admincontroller.usermanagementpost)

///  block and Unblock in User Management
router.get('/blockuser/:id', checkSession,admincontroller.block);
router.get('/unblockuser/:id',  admincontroller.unblock);
// 

//catogory management
router.get("/categorymanagement",checkSession,admincontroller.categorymanagement)


router.get("/addcategory",checkSession,admincontroller.addCategoryGet)
// Route to add a category
router.post('/addcategory', admincontroller.addCategoryPost);

// Route to edit a category
router.get('/editcategory/:id', checkSession,admincontroller.editCategoryget);
router.post('/editcategory/:id', admincontroller.editCategorypost);

// Route to list and unlist category a category


router.get("/unListcategory/:id", checkSession,admincontroller.UnList);

//route to render admin order page

router.get("/orderManagement",checkSession,admincontroller.orderget)

router.post("/update-status/:orderId/:productId", admincontroller.updateOrderpost);









router.get('/Logoutget', admincontroller.getLogout); 
module.exports=router ; 