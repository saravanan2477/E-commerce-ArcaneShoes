const mongoose = require('mongoose')


const productofferschema=new mongoose.Schema({
    productname:{
        type:String,
    },
    price:{
        type:Number
    },
    productoffer:{
        type:Number
    },
  
}) 
const productoffer = mongoose.model('productoffer',productofferschema)
module.exports=  productoffer;