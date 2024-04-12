const express= require("express");
const router= express.Router()
const orderController= require("../controller/orderController")

const checkSessionBlocked= require("../Middleware/user");





 router.get("/checkoutpage",orderController.getcheckout)



 //! add address 

router.get("/orderAddress",orderController.addAddresscheckout)
router.post("/orderAddresspost",orderController.addAddresspostcheckout)

router.get("/placeOrderget",orderController.Placeorder)



module.exports= router;