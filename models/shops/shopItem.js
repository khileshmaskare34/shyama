const mongoose = require("mongoose");
mongoose.set('strictQuery',true);
var shopItemSchema = mongoose.Schema({
    item_Name : {
        type : String,
        required : true
    },
    description : {
        type : String
    },
    Image :{
        type : String
    },
    price :{
        type : Number,
        required: true
    },
    shop_id:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model("shopItemSchema", shopItemSchema);