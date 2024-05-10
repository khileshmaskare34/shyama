const express = require("express");
const loungeSchema = require('../models/lounges/loungeSchema');
const loungeProviderSchema = require("../models/lounges/loungeProviderSchema");
const orderdLounge = require("../models/lounges/orderdLounge");
const shopRegistration = require('../models/shops/shopSchema');
const shop_items = require('../models/shops/shopItem')
const users = require('../models/users/users');
const jwt = require('jsonwebtoken');
const fs = require('fs')
const rawData = fs.readFileSync('stations.json');
const stationsArray = JSON.parse(rawData);

exports.lounge_provider_login = async (req, res, next) => {
    try {
        var email = req.body.email;
        const pass = req.body.password;

        if (!email || !pass) {
            return res.status(401).render('loungeProvider_login', { error: 'Incorrect email or password !' });

            // res.send("Please enter valid email and password");
        }

        const LoungeUser = await loungeProviderSchema.findOne({ email: email });

        if (!LoungeUser || !(pass === LoungeUser.password)) {
            // res.send("Please enter the right password and email");
            return res.status(401).render('loungeProvider_login', { error: 'Incorrect email or password !' });

        }

        const token = jwt.sign(
            { id: LoungeUser._id },
            'mynameispulkitupadhyayfromharda',
            {
                expiresIn: '10d',
            }
        );
        
        res.cookie('Token', token, { httpOnly: true, maxAge: 1.728e8 });
        res.cookie('loungeProvider_email', LoungeUser.email);

        res.redirect('/lounge/lounge_provider_admin');
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
}

exports.lounge_provider_register = async (req, res, next) => {
    try {
        var newProvider = new loungeProviderSchema({
            name: req.body.name,
            email: req.body.email,
            phoneNo: req.body.phoneNo,
            password: req.body.password 
        });
     
        const savedProvider = await newProvider.save();

        res.cookie('loungeProvider_email', req.body.email);
        res.redirect('/loungeRegistration');
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
}

exports.lounge_provider_signout = async (req, res, next) =>{
    const token = req.cookies.Token
    jwt.verify(
     token,
      'mynameispulkitupadhyayfromharda',
      (err, authData) => {
        if (err) {
          res.sendStatus(403);
        } else {
          res.clearCookie('Token');
          res.clearCookie('loungeProvider_email');
          res.redirect('/');
        }
      }
    );
}

exports.lounge_registration = async (req, res, next) => {
    // console.log( "khilesh"+ req.file.loungeImage);
    try {
        var email = req.cookies.loungeProvider_email;
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }
        const imageFilename = req.file.filename;

        var newLounge = new loungeSchema({
            loungeName: req.body.loungeName,
            loungeEmail: req.body.loungeEmail,
            loungePhoneNo: req.body.loungePhoneNo,
            noOfSeats: req.body.noOfSeats,
            loungeImage: imageFilename,
            stationLocation: req.body.stationLocation,
            loungeProviderId: req.body.loungeProviderId
        });

        await newLounge.save();
        // console.log("luck" + newLounge)

        res.redirect("/lounge_provider_admin");
        
    } catch (error) {
      
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred khilesh");
        // return res.status(401).redirect('/loungeRegistration', { error: 'This station name is all ready registered !' });

    }
}

exports.add_lounges = async (req, res, next) => {
    try {
        var perticuler_launge = await loungeSchema.findOne({ _id: req.params.id });

        if (!perticuler_launge) {
            console.log("Lounge not found");
            return res.status(404).send("Lounge not found");
        }

        var orders = await orderdLounge.find({ loungeId: perticuler_launge._id });
        var users1 = [];

        for (var i = 0; i < orders.length; i++) {
            for (var j = 0; j < orders[i].seats.length; j++) {
                var current_user = await users.findOne({ _id: orders[i].userId });
                users1.push(current_user);
            }
        }

        res.render('for_perticuler_launge_admin', { perticuler_launge, orders, users1 });
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
}

exports.delete_lounge = async (req, res, next) => {
    try {
        await loungeSchema.findOneAndDelete({ _id: req.body.loungeId_for_delete });
        console.log('deleted');
        res.redirect('/lounge_provider_admin');
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
}

exports.edit_lounge = async (req, res, next) => {
    try {
        let edit_lounge = await loungeSchema.findOneAndUpdate(
            { _id: req.body.loungeId_for_delete },
            {
                $set: {
                    loungeName: req.body.loungeName,
                    loungePhoneNo: req.body.loungePhoneNo,
                    loungeEmail: req.body.loungeEmail,
                    noOfSeats: req.body.noOfSeats
                }
            },
            { new: true }
        );
        
        console.log("edit_Loun" + edit_lounge);
        console.log('updated');
        res.redirect('/lounge_provider_admin');
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
}

exports.get_lounge_registration = async (req, res) => {
    try {
        var email = req.cookies.loungeProvider_email;

        var loungeProvider = await loungeProviderSchema.findOne({ email: email });

        if (!loungeProvider) {
            console.log("Lounge provider not found");
            return res.status(404).send("Lounge provider not found");
        }

        var launges = await loungeSchema.find({ loungeProviderId: loungeProvider._id });

        res.render('loungeRegistration', { loungeProvider, launges, stationsArray });
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
}

exports.lounge_provider_admin = async (req, res, next) => {
    try {
        var LoungeUser = await loungeProviderSchema.findOne({ email: req.cookies.loungeProvider_email });

        if (!LoungeUser) {
            console.log("Lounge provider not found");
            return res.status(404).send("Lounge provider not found");
        }

        var his_launges = await loungeSchema.find({ loungeProviderId: LoungeUser._id });

        var email = req.cookies.loungeProvider_email;

        var loungeProvider = await loungeProviderSchema.findOne({ email: email });

        res.render('longe_provider_admin', { LoungeUser, his_launges, loungeProvider });
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
}