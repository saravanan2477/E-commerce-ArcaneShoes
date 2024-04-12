const mongoose = require('mongoose')
const loginschema = new mongoose.Schema({
    username: {
        type: String,
    },
    email: {
        type: String, 
        unique: true  
    },
    password: {
        type: String,
    },
    isblocked: {
        type: Boolean
    },
    otp: {
        type: String,
    },
    
    
});

const users = mongoose.model('users', loginschema);

module.exports = users;