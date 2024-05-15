const mongoose = require('mongoose')

const categoryOfferschema=new mongoose.Schema({
    category: {
        type: String 
    },
    alloffer:{
        type:Number
    },
}) 
const categoryOffer =mongoose.model('categoryOffer',categoryOfferschema)
module.exports =  categoryOffer;