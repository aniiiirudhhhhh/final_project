const mongoose = require("mongoose");
// const { trim } = require("zod");
// const { de } = require("zod/v4/locales");

const rewardSchema = new mongoose.Schema({

    title : {
        type : String,
        required : true,
        trim : true
    },
    description : {
        type : String,
        required : true,
        trim : true
    },
    points : {
        type : Number,
        required : true,
        min : 1
    },
    quantity : {
        type : Number,
        default : 1,
    },
    createdBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true 
    }
},{timestamps:true});

module.exports = mongoose.model("Reward", rewardSchema);