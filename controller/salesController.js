const Ordercollection=require("../model/order")

const { Table } = require('pdfkit-table'); // Import Table from pdfkit-table module
const ExcelJS = require('exceljs')

// const PDFDocument = require('pdfkit');
const PDFDocument  = require('pdfkit-table')

module.exports={




//// sales 
 sales: async(req,res)=>{
    try{
    const orderdetalist = await Ordercollection.find()
    res.render("sales", { orderdetalist});
    }catch (err) {
      console.error(err);
      return res.status(500).send("Failed to order page.");
    }
    },
  
    //// SalesReportFilter
  //// SalesReportFilter
  
    costomSales: async (req, res) => {
    try {
        // Parse and validate start date
        const startDate = new Date(req.body.start_date);
        if (isNaN(startDate)) {
            throw new Error('Invalid start date');
        }

        // Parse and validate end date
        const endDate = new Date(req.body.end_date);
        if (isNaN(endDate)) {
            throw new Error('Invalid end date');
        }

        // Ensure end date is greater than start date
        if (endDate < startDate) {
            throw new Error('End date cannot be earlier than start date');
        }

        // Find orders within the date range
        const orderdetalist = await Ordercollection.find({
            orderDate: { $gte: startDate, $lte: endDate }
        }).sort({
            orderDate: -1
        });

        res.render('Sales', { orderdetalist });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
},



SalesFilter: async (req, res) => {
  try {
      const reportType = req.query.type;
      const currentDate = new Date();
      let startDate;
      let endDate = new Date();

      if (reportType === 'daily') {
          startDate = new Date(currentDate.setHours(0, 0, 0, 0));
      } else if (reportType === 'weekly') {
          const first = currentDate.getDate() - currentDate.getDay();
          startDate = new Date(currentDate.setDate(first));
          startDate.setHours(0, 0, 0, 0);
      } else if (reportType === 'monthly') {
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      }

      endDate.setHours(23, 59, 59, 999); // End of the current day

      const orderdetalist = await Ordercollection.find({
          orderDate: { $gte: startDate, $lte: endDate }
      }).sort({ orderDate: -1 });

      res.json(orderdetalist);
  } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
  }
},



// Controller function to generate PDF report
 pdfReport : async (req, res) => {
  try {
    const startdate = new Date(req.query.startingdate);
    const Endingdate = new Date(req.query.endingdate);
    Endingdate.setDate(Endingdate.getDate() + 1);

    const orderCursor = await Ordercollection.aggregate([
      {
        $match: {
          orderDate: { $gte: startdate, $lte: Endingdate }
        }
      }
    ]);

    // if (orderCursor.length === 0) {
    //   return res.redirect('/admin/salesreport');
    // }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    // Add data to the worksheet
    worksheet.columns = [
      { header: 'Username', key: 'username', width: 15 },
      { header: 'Product Name', key: 'productname', width: 20 },
      { header: 'Quantity', key: 'quantity', width: 15 },
      { header: 'Price', key: 'price', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Order Date', key: 'orderdate', width: 18 },
      { header: 'Address', key: 'address', width: 30 },
      { header: 'City', key: 'city', width: 20 },      // Add City column
      { header: 'Pincode', key: 'pincode', width: 15 }, // Add Pincode column
      { header: 'Phone', key: 'phone', width: 15 }      // Add Phone column
    ];

    for (const orderItem of orderCursor) {
    for (const product  of orderItem.productcollection) {
      console.log("orderItem is",orderItem);
      
      
      worksheet.addRow({
        'username': orderItem.addresscollection.firstname,


        'productname': product.productName,
        'quantity': product.quantity,
        'price': product.price,
        'status': product.status,
        'orderdate': orderItem.orderDate.toLocaleString(),
        'address': orderItem.addresscollection ? orderItem.addresscollection.address : 'N/A',

        'city': orderItem.addresscollection ? orderItem.addresscollection.city : 'N/A',
        'pincode': orderItem.addresscollection ? orderItem.addresscollection.pincode : 'N/A',
        'phone': orderItem.addresscollection ? orderItem.addresscollection.phone : 'N/A'
      });
    }
    }

    // Generate the Excel file and send it as a response
    workbook.xlsx.writeBuffer().then((buffer) => {
      const excelBuffer = Buffer.from(buffer);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=excel.xlsx');
      res.send(excelBuffer);
    });
  } catch (error) {
    console.error('Error creating or sending Excel file:', error);
    res.status(500).send('Internal Server Error');
  }
},


  ///// pdf ////////////////////////////
   excelReport :async (req, res) => {
    try { 
      const startingDate = new Date(req.query.startingdate);
      const endingDate = new Date(req.query.endingdate);
      console.log("startingDatepdfg", startingDate);
      console.log("endingDatepdf", endingDate);

      // Fetch orders within the specified date range
      const orders = await Ordercollection.find({
        orderDate: { $gte: startingDate, $lte: endingDate }
      })
      
      console.log('orders', orders);

      // Create a PDF document
      const doc = new PDFDocument();
      const filename = "sales_report.pdf";

      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", "application/pdf");

      doc.pipe(res);

      // Add content to the PDF document
      doc.text("Sales Report", { align: "center", fontSize: 10, margin: 5 });

      // Define the table data
      const tableData = {
        headers: [
          "Username",
          "Product Name",
          "Price",
          "Quantity",
          "Address",
          "City",
          "Pincode",
          "Phone",
        ],
        rows: orders.map((order, index) => [
          order.addresscollection.firstname,
          order.productcollection.map((product) => product.productName).join(", "),
          order.productcollection.map((product) => product.price).join(", "),
          order.productcollection.map((product) => product.quantity).join(", "),
          order.addresscollection.address,
          order.addresscollection.city, 
          order.addresscollection.pincode,
          order.addresscollection.phone,
        ]),
      };
    
      // Draw the table
      await doc.table(tableData, {
        prepareHeader: () => doc.font("Helvetica-Bold"),
        prepareRow: () => doc.font("Helvetica"),
      });

      // Finalize the PDF document
      doc.end();
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).send("Internal Server Error");
    }
  }





}