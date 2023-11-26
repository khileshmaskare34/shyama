const mongoose=require("mongoose");
// mongoose.set('strictQuery',true);



var userSchema=mongoose.Schema({
  password:String,
  // username:String,
  email:String,
  name:String,
  phoneNo:Number
})


module.exports = mongoose.model("user",userSchema)