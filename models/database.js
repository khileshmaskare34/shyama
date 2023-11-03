const mongoose = require('mongoose');
exports.connectDataBase = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('connection established')
    } catch (error) {
        console.log(error);
    }
}