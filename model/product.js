const mongoose = require("mongoose");
const category = require("./category");

const productSchema = new mongoose.Schema({
  productname: {
    type: String,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: category,
  },
  price: {
    type: Number,
  },
  model: {
    type: String,
  },
  description: {
    type: String,
  },
  image: {
    type: [String],
  },
  stock: {
    type: Number,
  },
  brand: {
    type: String,
  },
  isListed: {
    type: Boolean,
  },
});

module.exports = mongoose.model("Product", productSchema);
