const express= require("express");
const router= express.Router()
const cartController= require("../controller/cartController")
const nocache= require("nocache");
const multer = require("multer");
const checkSessionBlocked= require("../Middleware/user")





router.get("/cart",checkSessionBlocked,cartController.getCart)
router.post('/updateQuantity/:productid', cartController.updateQuantity);

router.get('/addcart/:productId',checkSessionBlocked, cartController.addToCart);

router.get('/removecart/:productId', cartController.removeCartItem);


module.exports= router;