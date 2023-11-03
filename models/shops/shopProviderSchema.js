const mongoose=require("mongoose");
// mongoose.set('strictQuery',true);



var shopProviderSchema = mongoose.Schema({
 shopName:{
    type :String,
    required: true
 },
 shopEmail:{
    type :String,
    required: true
 },
 shopPassword:{
    type : String,
    required: true
 },
 shopPhoneNo : {
    type : Number,
    required: true
 }
})


module.exports = mongoose.model("shopProviderModel",shopProviderSchema)