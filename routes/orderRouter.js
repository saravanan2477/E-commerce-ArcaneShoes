const express= require("express");
const router= express.Router()
const orderController= require("../controller/orderController")

const checkSessionBlocked= require("../Middleware/user");





 router.get("/checkoutpage",orderController.getcheckout)



 //! add address 

router.get("/orderAddress",orderController.addAddresscheckout)
router.post("/orderAddresspost",orderController.addAddresspostcheckout)
router.post("/Checkoutpost",orderController.postcheckout)

router.get("/placeOrder",orderController.Placeorder)

router.get('/orderDetails/:orderid', orderController.orderDetailsget);



  //! user order get
  router.get("/userOrders",checkSessionBlocked,orderController.showUserOrders);

module.exports= router;