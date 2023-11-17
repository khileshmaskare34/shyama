const mongoose = require("mongoose");

const currentTime = new Date();

// Get the current UTC time in milliseconds
const currentUTCTime = currentTime.getTime();

// Calculate the time offset for India (IST) in milliseconds (5 hours and 30 minutes)
const ISTOffset = 5.5 * 60 * 60 * 1000;

// Get the current Indian time by adding the IST offset to the UTC time
const currentIndianTime = new Date(currentUTCTime + ISTOffset);


mongoose.set('strictQuery',true);
const LoungeOrders_prev = mongoose.Schema({
    
   expireTime:{
    type: Date,
    required: true
   },
    loungeName:{
        type: String,
    },
    userName:{
        type: String
    },
    loungeId:{
        type: String
    },
    userId:{
        type: String
    },
    seats:  {
        type: Object
    },
   
})
// LoungeOrders.index({ createdAt: 1 }, { expireAfterSeconds: '1m' });

module.exports = mongoose.model("previous_Orders",LoungeOrders_prev)
