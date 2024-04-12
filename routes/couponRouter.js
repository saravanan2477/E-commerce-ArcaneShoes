
const express = require('express')
const router = express.Router();
const CouponControllers=require('../controller/couponController');


/// coupon render
router.get('/couponManagement',CouponControllers.couponget);


////addcoupon 
router.get('/addCoupon',CouponControllers.addcouponget)
router.post('/Coupons',CouponControllers.addcouponpost)

router.get('/deletecoupon/:id',CouponControllers.deleteCoupon)


module.exports= router;