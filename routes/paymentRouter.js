const express = require('express');
const router = express.Router();
const paymentController = require('../controller/paymentController');







router.post('/create/orderId',paymentController.orderpayment)


module.exports = router;