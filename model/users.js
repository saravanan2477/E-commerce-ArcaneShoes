const mongoose = require('mongoose')
const loginschema = new mongoose.Schema({
    username: {
        type: String,
    },
    email: {
        type: String  
    },
    password: {
        type: String,
    },
    isblocked: {
        type: Boolean,
        default:false
    },
    otp: {
        type: String,
    },
    phone: {
        type: Number,
    },
    wallet:{
        type:Number,
        default:0
    },
    referralcode:{
        type: String,
    },
    googleId:{
        type:String
    }
});

const users = mongoose.model('users', loginschema);

module.exports = users;