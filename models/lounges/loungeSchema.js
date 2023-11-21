const mongoose = require("mongoose");
mongoose.set('strictQuery',true);
var loungeSchema = mongoose.Schema({
    loungeName : {
        type : String,
        required : true
    },
    loungePhoneNo : {
        type : String
    },
    loungeEmail :{
        type : String
    },
    loungeProviderId :{
        type : String,
        required: true
    },
    loungeImage:{
        type : String
    },
    noOfSeats:{
        type:Number
    },
    stationLocation:{
       
        type: String
        
    }
})

module.exports = mongoose.model("loungeModelSchema", loungeSchema);