const express= require("express");
const router= express.Router()
const orderController= require("../controller/orderController")

const checkSessionBlocked= require("../Middleware/user");





 router.get("/checkoutpage",checkSessionBlocked,orderController.getcheckout)



 //! add address 

router.get("/orderAddress",checkSessionBlocked,orderController.addAddresscheckout)
router.post("/orderAddresspost",orderController.addAddresspostcheckout)
router.post("/Checkoutpost",orderController.postcheckout)

router.get("/placeOrder",checkSessionBlocked,orderController.Placeorder)

router.get('/orderDetails/:orderid/:productid', checkSessionBlocked,orderController.orderDetailsget);



  //! user order get
router.get("/userOrders",checkSessionBlocked,orderController.showUserOrders);

router.get('/cancelOrder/:orderId/:productId', orderController.cancelOrder);

router.get('/return/:userid/:productid',orderController.orderReturn)


module.exports= router;