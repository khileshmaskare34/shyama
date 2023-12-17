let myDate;

const express = require("express");
const loungeSchema = require('../models/lounges/loungeSchema');
const loungeProviderSchema = require("../models/lounges/loungeProviderSchema");
const shopProviderSchema = require('../models/shops/shopProviderSchema');
const shopSchema = require('../models/shops/shopSchema');
const users = require('../models/users/users');
const orderdLounge = require('../models/lounges/orderdLounge');
const orderdFood  = require('../models/shops/orderdFood');
const shopItem = require('../models/shops/shopItem');
const shopItems = require('../models/shops/shopItem');
const Otp = require('../models/otp');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const fs = require('fs')
const rawData = fs.readFileSync('stations.json');
const stationsArray = JSON.parse(rawData);

exports.homepage = async function(req, res, next) {
    try {
       
       if(req.cookies.Token || req.cookies.user_email){

        let station = stationsArray;
       
       
        let loungess = await loungeSchema.find();
        // for (let i = 0; i < loungess.length; i++) {
        //     let station1 = loungess[i].stationLocation;
        //     station.push(station1);
        // }
        // console.log(station);

        // let items = [];

        // let a_i = await shopItem.find()

      
        res.render('loggedInindex', { station });
       }else{


        let loungess = await loungeSchema.find();
        
        let station = stationsArray;
      
        res.render('index', { station });
       }
       
       
    
    
    
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
};

exports.user_signin = async function (req, res, next) {
    try {
        const email = req.body.email;
        const pass = req.body.password;

        if (!email || !pass) {
            console.log('Please enter email and password');
            return res.status(400).render('login', { error: 'Please enter valid email and password.' });
        }

        const User = await users.findOne({ email: email });

        if (!User || !(pass === User.password)) {
            // Incorrect password or user not found
            console.log("Login failed: Incorrect email or password");
            return res.status(401).render('signin', { error: 'Incorrect email or password !' });
        } else {
            const token = jwt.sign(
                { id: User._id },
                'mynameispulkitupadhyayfromharda',
                {
                    expiresIn: '10d',
                }
            );
            res.cookie('Token', token, { httpOnly: true, maxAge: 1.728e8 });
            res.cookie('user_email', User.email);

            let loungess = await loungeSchema.find();
            let station = [];
            for (let i = 0; i < loungess.length; i++) {
                let station1 = loungess[i].stationLocation;
                station.push(station1);
            }

            res.redirect('/');
        }
    } catch (error) {
        console.error("An error occurred:", error);
        next(error); // Pass the error to the error handling middleware
    }
}

exports.user_signup = async (req, res, next) => {
    try {
        let loungess = await loungeSchema.find();
        let station = stationsArray;
       

        var newUser = new users({
            name: req.body.name,
            email: req.body.email,
            phoneNo:req.body.phoneNumber,
            password: req.body.password
        });

        await newUser.save();

        const token = jwt.sign(
            { id: newUser._id },
            'mynameispulkitupadhyayfromharda',
            {
                expiresIn: '10d',
            }
        );

        res.cookie('Token', token, { httpOnly: true, maxAge: 1.728e8 });
        res.cookie('user_email', newUser.email);

        res.render('loggedInindex', { station });
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
}

exports.user_signout = async (req, res, next) =>{
        const token = req.cookies.Token
        jwt.verify(
         token,
          'mynameispulkitupadhyayfromharda',
          (err, authData) => {
            if (err) {
              res.sendStatus(403);
            } else {
              res.clearCookie('Token');
              res.clearCookie('user_email');
              res.redirect('/');
            }
          }
        );
}

exports.user_account = async function (req, res, next) {
    try {
        let email = req.cookies.user_email;
        let user = await users.findOne({ email: email });
        console.log("lux" + user)

        if (!user) {
            console.log("User not found");
            return res.status(404).send("User not found");
        }

        let orders = await orderdLounge.find({ userId: user._id })
        console.log("Orders: ", orders);
        console.log("users", user)

        res.render('userAccountPage', { user, orders });
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
}
   
exports.your_Order = async function (req, res, next) {
    try {
        let email = req.cookies.user_email;
        let user = await users.findOne({ email: email });

        if (!user) {
            console.log("User not found");
            return res.status(404).send("User not found");
        }

        let orders = await orderdLounge.find({ userId: user._id })
        // console.log("Orders: ", orders);

        res.render('yourOrder', {orders });
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
}
exports.choice_filling = async(req, res)=>{
    const stationName = req.body.stationName
    const bedCount = req.body.bedCount;
    let hours = req.body.hours
  
    let checkin1 = req.body.checkIn
    let dateF = moment(checkin1).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
    let UTC_futureDate = moment(dateF).utc().add(hours, 'hours')
  
    myDate = UTC_futureDate ;
    let lounges = await loungeSchema.find({stationLocation: stationName})
    // console.log("khilesh" + lounges)
  
    res.render("chooseLaunge", {lounges})
}
exports.get_choice_filling = async(req, res)=>{
    const stationName = req.body.stationName
    const bedCount = req.body.bedCount;
    let hours = req.body.hours
  
    let checkin1 = req.body.checkIn
    let dateF = moment(checkin1).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
    let UTC_futureDate = moment(dateF).utc().add(hours, 'hours')
  
    myDate = UTC_futureDate ;
    let lounges = await loungeSchema.find({stationLocation: stationName})
    // console.log("khilesh" + lounges)
  
    res.render("chooseLaunge", {lounges})
}

exports.get_choose_lounge = async (req, res, next) => {
   
   if(req.cookies.user_email || req.cookies.Token){
    try {
        let laungeId = req.params.id;
        let launge = await loungeSchema.findOne({ _id: laungeId });

        if (!launge) {
            console.log("Lounge not found");
            return res.status(404).send("Lounge not found");
        }

        let laungesWithOrders = await orderdLounge.find({ loungeId: laungeId });
        let seatss = [];

        for (var i = 0; i < laungesWithOrders.length; i++) {
            let jiji = laungesWithOrders[i].seats;
            seatss.push(jiji);
        }

        let totalSeats = [];

        for (var k = 0; k < seatss.length; k++) {
            var ppp = seatss[k];
            for (var j = 0; j < ppp.length; j++) {
                totalSeats.push(ppp[j]);
            }
        }

        let email = req.cookies.user_email;
        let userx = await users.findOne({ email: email });

        res.render('shetbook', { launge, totalSeats, userx });
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }

}else{
    res.redirect('/user_signin')
}


}

exports.choose_lounge_id = async(req, res)=>{
    let launge = await loungeSchema.findOne({ _id: req.params.id})
    let laungeName = launge.loungeName;
    let user = await users.findOne({ email: req.cookies.user_email})
    let username = user.name;
    

    let seat_1;
    if(typeof req.body.seat !== 'object'){
      seat_1 = [req.body.seat]
    }else{
      seat_1 = req.body.seat
    }
    
    var newOrder = new orderdLounge({
      loungeName: req.body.loungeName,
      userName: user.name,
      loungeId: launge._id,
      userId: user._id,
      seats: seat_1,
      expireTime: myDate,
    })
    newOrder.save().then(function(dets){
      res.cookie('longe_booked_by_user', newOrder.loungeId, { httpOnly: true, maxAge: 1.728e8 });
      // res.redirect('/after_loungeBook_loggedInIndex')
      console.log(newOrder, user)
      res.render("selected_seat", {newOrder, user});
    })
}

exports.after_loungeBook_loggedInIndex = async(req, res)=>{
    var lounges_for_shop = await loungeSchema.find();
    let station = stationsArray;
    
  
    let lounge = await loungeSchema.findOne({ _id: req.cookies.longe_booked_by_user});  
    
    let shops1 = await shopSchema.find({ station_Name: lounge.stationLocation });  
    
    var all_items =[];
    for(var i = 0; i < shops1.length; i++){
      var shop_item = await  shopItems.find({ shop_id: shops1[i].shopEmail }) 
      all_items.push(shop_item);
    }
    
    let shop_name = await shopSchema.find();
    res.redirect('/');
    //   res.render('after_loungeBook_loggedInIndex', {station,lounge, all_items, shops1});
}
exports.particuler_item = async (req, res, next) => {
    
    var item = await shopItems.findOne({ _id: req.params.id });

    var shop_name = await shopSchema.findOne({  });


    res.render('foodSelection', { item, shop_name });

}


exports.seat_canslation= async (req, res, next) => {
    console.log(req.body.order_id)
        var order =  await orderdLounge.findOneAndDelete({_id: req.body.order_id})     
console.log("order deleted ")

res.redirect('/yourOrder')
}