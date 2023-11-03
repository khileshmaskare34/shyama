const mongoose = require("mongoose");
mongoose.set('strictQuery',true);
var orderFoodSchema = mongoose.Schema({
    item_Name : {
        type : String,
        required : true
    },
    item_id : {
        type : String
    },
    price :{
        type : Number,
        required: true
    },
    shop_id:{
        type: String,
        required: true
    },
     user_id:{
        type: String
    },
    quantity:{
        type:Number
    }
})

module.exports = mongoose.model("orderFood", orderFoodSchema);