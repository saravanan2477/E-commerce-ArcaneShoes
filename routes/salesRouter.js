const express = require("express");
const router = express.Router();
const salesController = require("../controller/salesController");
const checkSession =require('../Middleware/Admin')

router.get('/Sales',checkSession.checkSession,salesController.sales);
router.get('/salesfilter', salesController.SalesFilter);
router.post('/costomSales', salesController.costomSales);


//! Route for generating PDF report
router.get('/reportpdf',checkSession.checkSession,salesController. pdfReport);
//! Route for generating excel report
router.get('/reportexcel',checkSession.checkSession,salesController. excelReport);
module.exports = router;


 