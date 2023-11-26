const mongoose=require("mongoose");
// mongoose.set('strictQuery',true);



var userSchema=mongoose.Schema({
  password: {
    type : String,
    required : true
  },
  email: {
    type : String,
    required : true
  },
  name: {
    type : String,
    required : true
  },
  phoneNo: {
    type : Number,
    required : true
}
})


module.exports = mongoose.model("user",userSchema)