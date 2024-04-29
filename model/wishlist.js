const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    userid: {
        type: ObjectId
    },
    user: {
        type: String
    },
    productid: {
        type: String
    },
    product: {
        type: String
    },
    price: {
        type: Number
    },
    image: {
        type: String
    },
    category: {
        type: String
    },
    
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
