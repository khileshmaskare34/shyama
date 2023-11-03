const mongoose = require("mongoose");
mongoose.set('strictQuery',true);
var shopSchema = mongoose.Schema({
    shopName : {
        type : String,
        required : true
    },
    shopPhoneNo : {
        type : String
    },
    shopEmail :{
        type : String
    },
    shopProviderId :{
        type : String,
        required: true
    },
    station_Name :{
        type: String,
        required: true
    }
})

module.exports = mongoose.model("shopModelSchema", shopSchema);