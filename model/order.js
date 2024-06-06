const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const OrderSchema = new mongoose.Schema({
  userid: {
    type: ObjectId,
  },
  Username: {
    type: String,
  },
  productcollection: [
    {
      productid: {
        type: ObjectId,
      },
      productName: {
        type: String,
        required: true,
      },
      Category: {
        type: String,
      },
      price: {
        type: Number,
        required: true,
      },
   
      quantity: {
        type: Number,
        required: true,
      },
      proffer:{
        type: Number,
        required: true,
      },

      image: {
        type: [String],
      },
      status: {
        type: String,
      },
      finalPrice: {
        type: String,
        default: 0,
      },
    },
  ],

  // Corrected typo here from 'addrescollection' to 'addresscollection'
  addresscollection: {
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
    city: {
      type: String,
    },
    address: {
      type: String,
    },
    pincode: {
      type: Number,
    },
    state: {
      type: String,
    },
    phone: {
      type: Number,
    },
    email: {
      type: String,
    },
  },
  paymentMethod: {
    type: String,
  },

  totalPrice: {
    type: Number,
  },
  orderDate: {
    type: Date,
  },
  Discount: {
    type: Number,
  },
  intDiscount: {
    type: Number,
  },
});

const order = mongoose.model("order", OrderSchema);
module.exports = order;
