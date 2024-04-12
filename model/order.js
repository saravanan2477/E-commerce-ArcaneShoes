const { ObjectId } = require('mongodb')
const mongoose=require('mongoose')
const OrderSchema = new mongoose.Schema({
    userid: {
        type: ObjectId
    },
    Username: {
        type: String
    },
    productcollection: [
        {
            productid: {
                type: ObjectId
            },
            productName: {
                type: String,
                required: true
            },
            Category:{
                type:String
            },
            price: {
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            status:{
                type:String,
                required:true
            }
        
        }
    ],
 
    address: {
        type: Object
    },
    paymentMethod: {
        type: String
    },
   
totalPrice:{
    type: Number
},   
    
});

const order=mongoose.model('order',OrderSchema)
module.exports= order
