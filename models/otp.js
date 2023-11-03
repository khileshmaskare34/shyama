var mongoose = require('mongoose')


var otpSchema = mongoose.Schema({
  email:String,
  code:String,
  expireIn: Number
},{
    timestamps: true
})


module.exports = mongoose.model("otp", otpSchema);
