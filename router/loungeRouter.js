const express = require('express');
const fs = require('fs')
const rawData = fs.readFileSync('stations.json');
const stationsArray = JSON.parse(rawData);


const {lounge_provider_login,
    lounge_provider_register,
    lounge_registration,
    lounge_provider_admin,
    edit_lounge,
    delete_lounge,
    add_lounges,
    after_loungeBook_loggedInIndex,
    get_lounge_registration,
    lounge_provider_signout,
    
    } = require('../controller/loungeController')
const router = express.Router();
const jwt = require('jsonwebtoken');

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


router.get('/loungeProviderLogin', (req, res, next)=>{
    res.render('loungeProvider_login', {error:' '});
})
router.post('/loungeProviderLogin', lounge_provider_login)

router.get('/loungeProviderRegister', (req, res, next)=>{
    res.render('loungeProvider_register');
})
router.post('/loungeProviderRegister', lounge_provider_register)

router.post('/logout-lounge', lounge_provider_signout)

router.get('/lounge_provider_admin', lounge_provider_admin)
router.get('/loungeRegistration',get_lounge_registration )

router.post('/loungeRegistration',upload.single("loungeImage"), lounge_registration)

router.post('/edit_lounge', edit_lounge)

router.post('/delete_lounge', delete_lounge)
  

  
    


//  LOUNGE RELETED GET ROUTS

router.get('/shetbook', function(req, res, next){
    res.redirect('/choiceFilling');
  })

router.get('/laungeadminforaddingitems/:id', add_lounges)

router.post('/forgot-lounge-provider', async (req, res) => {
    try {
      const userEmail = req.body.newemail;
      const user = await providerModel.findOne({ email: userEmail });
  
      if (!user) {
        return res.status(401).render('forgot-lounge-provider ', { error: 'Incorrect email!..' });
        
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
  
       res.render('otpLoungeProvider',{userEmail, otpCode});
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        statusText: 'error',
        message: 'An error occurred while processing your request.',
      });
    }
  });

router.post('/otp-lounge-provider', async (req, res, next) => {
    const otpCode = req.body.otpNumber;
    
    try {
      const otpData = await Otp.findOne({ code: otpCode });
      
      if (!otpData) {
        return res.status(400).redirect('/otp-lounge-provider').json({
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
      res.render('reset-password-lounge-provider', { otpData });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        statusText: 'error',
        message: 'An error occurred while processing your request.',
      });
    }
});

router.post('/reset-lounge-provider', async (req, res) => {
    const { email, newPassword, otpCode } = req.body;
  
    try {
      // Find the OTP data in your database
      const otpData = await Otp.findOne({ email, code: otpCode });
  
      if (!otpData || otpData.expireIn < new Date().getTime()) {
  
        const message = "The OTP has expired. Please request a new OTP.";
        return res.render('reset-password-lounge-provider', { message, otpData });
      }
  
      // Find the user associated with the email in otpData
      const user = await providerModel.findOne({ email });
  
      if (!user) {
        return res.status(400).json({
          statusText: 'error',
          message: 'User not found.',
        });
      }
  
      console.log("previous pass"+user)
      // Update the user's password with the new one
      user.password = newPassword;
  
      // Save the updated user data
      await user.save();
      console.log("new pass"+user)
   
      // Delete the OTP data (since it's no longer needed)
      // await otpData.remove();
  
      res.redirect('/loungeProvider_login');
      
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        statusText: 'error',
        message: 'An error occurred while processing your request.',
      });
    }
  });
  
module.exports = router;