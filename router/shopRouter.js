const express = require('express');


const {shop_provider_login,
       shop_provider_register,
       get_shop_provider_admin,
       add_shops,
       edit_shop,
       delete_shop,
       food_selection,
       get_shop_reg,
       shop_registration,
       food_order,
       edit_item,
       delete_item,
       add_items,
       particuler_item,
       add_items_id,
       shop_provider_signout,
       show_food_at_station,
       choose_shop_id,
       selected_item_id,
      } = require('../controller/shopController')
const router = express.Router();

const multer = require('multer')
const path=require('path');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, './../public/upload'));
    },
    filename: (req, file, cb) => {
      const name = Date.now() + '-' + file.originalname;
      cb(null, name);
    },
  });
  var upload = multer({ storage: storage });


router.get('/', (req, res, next)=>{
  res.render('index');
})
  
router.get('/shopProviderLogin', (req, res, next)=>{
res.render('shopProvider_login',{ error: ' '});
})
router.post('/shopProviderLogin', shop_provider_login)

router.get('/shopProviderRegister', (req, res, next)=>{
res.render('shopProvider_register');
})
router.post('/shopProviderRegister', shop_provider_register)

router.post('/logout-shop', shop_provider_signout)

router.get('/foodSelection', food_selection)

router.get('/shopRegistration', get_shop_reg)
router.post('/shopRegistration', shop_registration)

//  SHOP RELETED GET ROUTES 

router.get('/shop_provider_admin', get_shop_provider_admin)
router.get('/shopadminforaddingitems/:id', add_shops)


router.post('/edit_shop', edit_shop)
router.post('/delete_shop', delete_shop)

router.post('/shop_choose/:id', choose_shop_id)
router.post('/selected_food/:id', selected_item_id)
 
// ITEM RELETED GET ROUTES  

router.get('/add_items/:id', add_items_id)
// router.get('/item/:id', particuler_item)

router.post('/showFoodAtStation', show_food_at_station)

// Item ----------------

router.post('/foodOrder', food_order)
router.post('/add_items', upload.single("item_image"), add_items);
router.post('/edit_item',upload.single("Image"), edit_item)
router.post('/delete_item', delete_item)

router.post('/forgot-shop-provider', async (req, res) => {
  try {
    const userEmail = req.body.newemail;
    const user = await shopProviderSchema.findOne({ shopEmail: userEmail });

    if (!user) {
      return res.status(401).render('forgot-shop-provider ', { error: 'Incorrect email!..' });
      
    }

    // Generate a random OTP (4 digits)
    const otpCode = Math.floor(1000 + Math.random() * 9000);

    // Save the OTP in your database
    const otpData = new Otp({
      email: userEmail,
      code: otpCode,
      expireIn: new Date().getTime() + 60 * 1000, // OTP expiration time (5 minutes)
    });

    await otpData.save();

    // Send the OTP via email
    await sendOtpEmail(userEmail, otpCode);

     res.render('otpShopProvider',{userEmail, otpCode});
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusText: 'error',
      message: 'An error occurred while processing your request.',
    });
  }
});

router.post('/otp-shop-provider', async (req, res, next) => {
  const otpCode = req.body.otpNumber;
  
  try {
    const otpData = await Otp.findOne({ code: otpCode });
    
    if (!otpData) {
      return res.status(400).redirect('/otp-shop-provider').json({
        statusText: 'error',
        message: 'Invalid OTP code',
      });
    }

    const currentTime = new Date().getTime();
    const diff = otpData.expireIn - currentTime;

    if (diff < 0) {
      return res.status(400).json({
        statusText: 'error',
        message: 'Token Expired',
      });
    }

    // If the OTP code is valid and not expired, render the 'reset-password' template
    res.render('reset-password-shop-provider', { otpData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusText: 'error',
      message: 'An error occurred while processing your request.',
    });
  }
});

router.post('/reset-shop-provider', async (req, res) => {
  const { email, newPassword, otpCode } = req.body;

  try {
    // Find the OTP data in your database
    const otpData = await Otp.findOne({ email, code: otpCode });

    if (!otpData || otpData.expireIn < new Date().getTime()) {

      const message = "The OTP has expired. Please request a new OTP.";
      return res.render('reset-password-shop-provider', { message, otpData });
    }

    
    // Find the user associated with the email in otpData
    const user = await shopProviderSchema.findOne({ email });
    
    if (!user) {
      return res.status(400).json({
        statusText: 'error',
        message: 'User not found.',
      });
    }
    
    // Update the user's password with the new one
    user.password = newPassword;
    
    // Save the updated user data
    await user.save();
    console.log("khilesh"+ user)

    // Delete the OTP data (since it's no longer needed)
    // await otpData.remove();

    res.redirect('/shopProvider_login');
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusText: 'error',
      message: 'An error occurred while processing your request.',
    });
  }
});


module.exports = router;