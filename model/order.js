const { Schema, model } = require("mongoose");

const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    addressId: {
        type: Schema.Types.ObjectId,
        ref: 'UserAddress',
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    items: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
        },
        purchasedQty:{
            type:Number,
            required:true,
        },
        payablePrice: {
            type: Number,
            required: true,
        },
    }],
    paymentStatus: {
        type: String,
        enum: ["pending", "completed", "cancelled", "refund", "failed"],
        required: true,
    },
    OrderedDate:{
        type:Date,
    },
    paymentType:{
        type:String,
        enum:["cod","card"],
        required:true,
    },
    orderStatus:[
        {
            type:{
                type:String,
                enum:["ordered","packed","shipped","delivered"],
                default:"ordered",
            },
            date:{
                type:Date
            },
            isCompleted:{
                type:Boolean,
                default:false,
            }
        }
    ],
    
    

}, { timestamps: true });

module.exports = model('Order', orderSchema);
