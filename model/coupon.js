const mongoose=require('mongoose')

const couponschema=new mongoose.Schema({
    coupencode:{
        type:String
    },
    discount:{
        type:Number
    },
    expiredate:{
        type:Date
    },
    purchaseamount:{
        type:Number
    }

})
const coupenstructure= mongoose.model('Coupon',couponschema)

module.exports=coupenstructure;