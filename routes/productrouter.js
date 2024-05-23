const express = require("express");
const router = express.Router();
const nocache = require("nocache");
const path = require('path')
const multer = require("multer");
const productController = require("../controller/productController");
router.use(nocache());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage }).array('img');



const checkSession = async (req, res, next) => {
    if (req.session.admin) {
      next();
    } else {
      // No userId in session, redirect to the default page
      res.redirect("/admin/adminlogin");
    }
  };

router.get("/productmanagement", checkSession, productController.getProductManagement);

router.get("/addProduct",checkSession,   productController.getAddProduct);
 

router.post("/addproduct", upload, productController.postAddProduct);
router.get("/editproduct/:id", checkSession,  productController.getEditProduct);
router.post("/editproduct/:id",upload,  productController.postEditProduct);
router.get("/deleteproduct/:id",  productController.getproductdelete);
router.get("/unlistproduct/:id", productController.getUnlistProduct);
router.post("/deleteimage", productController.deleteimage);

//! product details page get
router.get("/getproduct/:id", productController.getproduct);


module.exports=router ; 