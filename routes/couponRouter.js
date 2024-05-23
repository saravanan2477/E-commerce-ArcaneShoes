const express = require('express')
const router = express.Router();
const CouponControllers=require('../controller/couponController');



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
  


/// coupon render
router.get('/couponManagement',CouponControllers.couponget);


////addcoupon 
router.get('/addCoupon',CouponControllers.addcouponget)
router.post('/Coupons',CouponControllers.addcouponpost)

router.get('/deletecoupon/:id',CouponControllers.deleteCoupon)



//! all coupons in user
router.get('/allCoupons',CouponControllers.allCouponsget)

router.post('/coupencheck',CouponControllers.coupencheck)

router.post('/deleteCoupon', CouponControllers.couponremove);


//! offers

//// product Offer
router.get('/offerManagement', checkSession, CouponControllers. poductOffer);
////// add product offer render
router.get('/addProductOffer', checkSession, CouponControllers. addProductOffer);
router.post('/addProductOffer', checkSession, CouponControllers. productOfferpost);
// ///// delete product offer
router.get('/deleteproductoffer/:id', checkSession, CouponControllers. DeleteProductOffer);


// ////// add product offer render
router.get('/addCategoryOffer', checkSession, CouponControllers. addCategoryOffer);
router.post('/addCategoryOffer', checkSession, CouponControllers. addCategoryOfferpost);
// ///// delete product offer
router.get('/DeleteCategoryOffer/:id', checkSession, CouponControllers. DeleteCategoryOffer);




module.exports= router;