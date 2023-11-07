const express = require('express');
const shopProviderSchema = require('../models/shops/shopProviderSchema');
const shopSchema = require('../models/shops/shopSchema');
const shopRegistration = require('../models/shops/shopSchema');
const shop_items = require('../models/shops/shopItem')
const loungeSchema = require('../models/lounges/loungeSchema');
const users = require('../models/users/users')
const orderItem = require('../models/shops/orderdFood')
const jwt = require('jsonwebtoken');

exports.shop_provider_login = async (req, res, next) => {
    try {
        var shopemail = req.body.shopEmail;
        const shoppass = req.body.shopPassword;

        if (!shopemail || !shoppass) {
            // res.send("Please enter valid email and password");
            return res.status(401).render('shopProvider_login', { error: 'Incorrect email or password !' });

        }

        const shopUser = await shopProviderSchema.findOne({ shopEmail: shopemail });

        if (!shopUser || !(shoppass === shopUser.shopPassword)) {
            // res.send("Please enter the right password and email");
            return res.status(401).render('shopProvider_login', { error: 'Incorrect email or password !' });

        } else {
            var shops = await shopSchema.find({ shopProviderId: shopUser._id });

            const token = jwt.sign(
                { id: shopUser._id },
                'mynameispulkitupadhyayfromharda',
                {
                    expiresIn: '10d',
                }
            );

            res.cookie('Token', token, { httpOnly: true, maxAge: 1.728e8 });
            res.cookie('shopProvider_email', shopUser.shopEmail, { httpOnly: true, maxAge: 1.728e8 });

            res.redirect("/shop/shop_provider_admin");
        }
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
}

exports.shop_provider_register = async (req, res, next) => {
    try {
        var newShopProvider = new shopProviderSchema({
            shopName: req.body.shopName,
            shopEmail: req.body.shopEmail,
            shopPhoneNo: req.body.shopPhoneNo,
            shopPassword: req.body.shopPassword,
        })

        const savedShopProvider = await newShopProvider.save();
        
        if (savedShopProvider) {
            res.cookie('shopProvider_email', req.body.shopEmail);
            res.redirect('/shop/shopRegistration');
        } else {
            console.log("Failed to save shop provider");
            res.status(500).send("Failed to save shop provider");
        }
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
}

exports.get_shop_provider_admin = async (req, res, next) => {
    try {
        const shopUser = await shopProviderSchema.findOne({ shopEmail: req.cookies.shopProvider_email });

        if (!shopUser) {
            console.log("Shop provider not found");
            return res.status(404).send("Shop provider not found");
        }

        var shops = await shopRegistration.find({ shopProviderId: shopUser._id });

        res.render('shop_provider_home', { shopUser, shops });
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
}

exports.add_shops = async (req, res, next) => {
    try {
        let perticuler_shop = await shopRegistration.findOne({ _id: req.params.id });

        if (!perticuler_shop) {
            console.log("Shop not found");
            return res.status(404).send("Shop not found");
        }

        let items = await shop_items.find({ shop_id: perticuler_shop.shopEmail });

        res.render('shop_admin_for_adding_items', { perticuler_shop, items });
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
}

exports.delete_shop = async (req, res, next) => {
    try {
        await shopRegistration.findOneAndDelete({ _id: req.body.shopId_for_delete });
  
        res.redirect('/shop/shop_provider_admin');
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
}

exports.edit_shop = async (req, res, next) => {
    try {
        let edit_shop = await shopRegistration.findOneAndUpdate(
            { _id: req.body.shopId_for_delete },
            {
                $set: {
                    shopName: req.body.shopName,
                    station_Name: req.body.station,
                    shopPhoneNo: req.body.shopPhoneNo,
                    shopEmail: req.body.shopEmail,
                },
            },
            { new: true }
        );

        if (!edit_shop) {
            console.log("Shop not found");
            return res.status(404).send("Shop not found");
        }

        res.redirect('/shop/shop_provider_admin');
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
}

exports.food_selection = async (req, res, next) => {
    try {
        let lounge = await loungeSchema.findOne({ _id: req.cookies.longe_booked_by_user });

        if (!lounge) {
            console.log("Lounge not found");
            return res.status(404).send("Lounge not found");
        }

        let shops1 = await shopRegistration.find({ station_Name: lounge.stationLocation });

        var all_items = [];

        for (var i = 0; i < shops1.length; i++) {
            var shop_item = await shop_items.find({ shop_id: shops1[i].shopEmail });
            all_items.push(shop_item);
        }

        res.render('foodSelection', { all_items });
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
}

exports.get_shop_reg = async (req, res) => {
    try {
        var email = req.cookies.shopProvider_email;
        var shopProvider = await shopProviderSchema.findOne({ email: email });
        const shopUser = await shopProviderSchema.findOne({ shopEmail: req.cookies.shopProvider_email });
        if (!shopProvider) {
            console.log("Shop provider not found");
            return res.status(404).send("Shop provider not found");
        }

        res.render('shopRegistration', { shopProvider, shopUser });
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
}

exports.shop_registration = async (req, res, next) => {
    try {
        var newShop = new shopRegistration({
            shopName: req.body.shopName,
            shopEmail: req.body.shopEmail,
            shopPhoneNo: req.body.shopPhoneNo,
            shopProviderId: req.body.shopProviderId,
            station_Name: req.body.station
        });

        var email = req.cookies.shopProvider_email;
        var shopProvider = await shopProviderSchema.findOne({ shopEmail: email });

        newShop.save().then(function(dets) {
            res.render('add_items_of_shop', { shopProvider, newShop });
        });
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
}




// shop items 

exports.add_items = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        const imageFilename = req.file.filename;

        var new_item = new shop_items({
            item_Name: req.body.item_name,
            description: req.body.description,
            Image: imageFilename,
            price: req.body.item_price,
            shop_id: req.body.shopId
        });

        await new_item.save();

        res.redirect("/shop/shop_provider_admin");
    } catch (error){
        console.error("An error occurred:", error);
        res.status(500).send("Internal Server Error");
    }
}

exports.add_items_id = async (req, res, next) => {
    try {
        var newShop = await shopRegistration.findOne({ _id: req.params.id });

        if (!newShop) {
            console.log("Shop not found");
            return res.status(404).send("Shop not found");
        }

        res.render('add_items_of_shop', { newShop });
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
}

exports.delete_item = async (req, res, next) => {
    try {
        var shopItem = await shop_items.findOne({ _id: req.body.itemId_for_delete });

        if (!shopItem) {
            console.log("Item not found");
            return res.status(404).send("Item not found");
        }

        var idddd = shopItem.shop_id;
        var shopForId = await shopRegistration.findOne({ shopEmail: idddd });

        if (!shopForId) {
            console.log("Shop not found");
            return res.status(404).send("Shop not found");
        }

        console.log('Deleted');
        var pathji = `/shop/shopadminforaddingitems/` + shopForId._id;
        await shop_items.findOneAndDelete({ _id: req.body.itemId_for_delete });

        res.redirect(pathji);
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
}

exports.edit_item = async (req, res, next) => {
    try {
        const imageFilename = req.file.filename;

        let editedItem = await shop_items.findOneAndUpdate(
            { _id: req.body.itemId_for_delete },
            {
                $set: {
                    item_Name: req.body.item_Name,
                    description: req.body.description,
                    Image: imageFilename,
                    price: req.body.item_price,
                    shop_id: req.body.shopId,
                },
            },
            { new: true }
        );

        if (!editedItem) {
            console.log("Item not found");
            return res.status(404).send("Item not found");
        }

        res.redirect('/shop/shop_provider_admin');
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
}

exports.food_order = async (req, res, next) => {
    try {
        const itemid = req.body.itemid;
        const item = await shop_items.findOne({ _id: itemid });

        if (!item) {
            console.log("Item not found");
            return res.status(404).send("Item not found");
        }

        const user = await users.findOne({ email: req.cookies.user_email });

        if (!user) {
            console.log("User not found");
            return res.status(404).send("User not found");
        }

        const quantitys = req.body.quantity;
        const shop = await shopRegistration.findOne({ shopEmail: item.shop_id });

        if (!shop) {
            console.log("Shop not found");
            return res.status(404).send("Shop not found");
        }

        var itemName = item.item_Name;
        var itemId = item._id;
        var itemPrice = item.price;
        var shopId = shop._id;
        var userId = user._id;

        var order_item = new orderItem({
            item_Name: itemName,
            item_id: itemId,
            price: itemPrice,
            shop_id: shopId,
            user_id: userId,
            quantity: quantitys,
        });

        order_item.save().then(function () {
            // res.send("Product saved in the database");
            res.redirect('/after_loungeBook_loggedInIndex')
        });
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
}

exports.particuler_item = async (req, res, next) => {
    
    var item = await shop_items.findOne({ _id: req.params.id });

    var shop_name = await shopRegistration.findOne({  });


    res.render('foodSelection', { item, shop_name });

}