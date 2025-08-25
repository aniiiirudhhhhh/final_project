const Reward = require("../models/rewards.models");
const User = require("../models/user.model");

const createReward = async(req,res) =>{
    try{
        const {title,description,points,quantity} = req.body;
        const reward = await Reward.create({
            title,
            description,
            points,
            quantity,
            createdBy: req.user._id
        });
        res.status(201).json(reward);
    }catch(e){
        res.status(500).json({message : e.message});
    }
}

const getReward = async(req,res)=>{
    try{
        const reward = await Reward.find().sort({createdAt: -1});
        res.status(200).json(reward);
    }catch(e){
        res.status(500).json({message : e.message});    
    }
}




module.exports = {
    createReward,
    getReward
}