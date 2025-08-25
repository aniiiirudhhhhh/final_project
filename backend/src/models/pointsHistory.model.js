const mongoose = require('mongoose');

const pointsHistorySchema = new mongoose.Schema({

    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    points : {
        type : Number,
        required : true
    },
    type : {
        type : String,
        enum : ['earn','deduct'],
        required : true
    },
    source: { 
        type: String,
        enum: ['admin', 'purchase', 'referral', 'bonus'], 
        required: true 
    }
},{timestamps : true})
module.exports = mongoose.model("PointsHistory", pointsHistorySchema);