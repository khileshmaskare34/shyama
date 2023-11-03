const mongoose=require("mongoose");
// mongoose.set('strictQuery',true);



var loungeProviderSchema = mongoose.Schema({
 name:{
    type :String,
    required: true
 },
 email:{
   type :String,

    required: true
 },
 password:{
    type : String,
    required: true
 },
 phoneNo : {
    type : Number,
    required: true
 }
})


module.exports = mongoose.model("loungeProviderModel",loungeProviderSchema)