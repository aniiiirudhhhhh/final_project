const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({

    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    reward : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Reward",
        required : true
    },
    points : {
        type : Number,
        required : true
    },
    status: {
        type: String,
        enum : ['redeemed', 'pending', 'cancelled'],
        default : 'redeemed'
    }
},{timestamps : true})

module.exports = mongoose.model("Transaction", transactionSchema);