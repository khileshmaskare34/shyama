let myDate;
const express = require("express");
const users = require("../models/users/users");
const loungeSchema = require("../models/lounges/loungeSchema");
const Otp = require("../models/otp");
const nodemailer = require("nodemailer");
const moment = require("moment");
const longeOrders = require("./../models/lounges/orderdLounge");
const {
  user_signin,
  user_signup,
  homepage,
  user_account,
  choice_filling,
  choose_lounge_id,
  get_choose_lounge,
  particuler_item,
  after_loungeBook_loggedInIndex,
  user_signout,
  your_Order,
  seat_canslation,
  get_choice_filling
} = require("../controller/indexController");

const { checkTokenExpiration } = require('../middlewears/auth'); // Import the middleware


const router = express.Router();
const jwt = require("jsonwebtoken");
const schedule = require("node-schedule");
const prev_orders = require("./../models/lounges/pevious_orders");

//  ************** The scheduler which runs every 1 hour and 1 minut ******************
schedule.scheduleJob("1 */1 * * *", () => {
  console.log("This task will run every 1 hour and 1 minute." + new Date());
  let current = new Date();
  let current_utc = moment(current).utc();
  async function deleted() {
    console.log(deleted);
    try {
      var all_expired_orders = await longeOrders.find({
        expireTime: { $lt: current_utc },
      });

      for (var i = 0; i < all_expired_orders.length; i++) {
        var current_prev_order = all_expired_orders[i];

        var new_prev_Order = new prev_orders({
          loungeName: current_prev_order.loungeName,
          userName: current_prev_order.userName,
          loungeId: current_prev_order.loungeId,
          userId: current_prev_order.userId,

          seats: current_prev_order.seats,
          expireTime: current_prev_order.expireTime,
        });
        await new_prev_Order.save();
      }

      await longeOrders.deleteMany({ expireTime: { $lt: current_utc } });
    } catch (error) {
      console.log(error);
    }
  }
  deleted();
});

//    payment gateway
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.kEY_SECRET, // Removed the extra space at the end
});

router.get("/", homepage);

router.get("/get-started", (req, res, next) => {
  res.render("get-started");
});

router.get("/user_signin", (req, res, next) => {
  let originalUrl = req.query.originalUrl || '/';
  originalUrl = decodeURIComponent(originalUrl); // Decode the URL

  console.log("Original URL:", originalUrl);

  res.render("signin", { error: "", originalUrl});
});
router.post("/user_signin", user_signin);

router.get("/user_signup", (req, res, next) => {
  res.render("signup");
});
router.post("/user_signup",  user_signup);

router.post("/logout", user_signout);

router.get("/provider", (req, res, next) => {
  res.render("provider");
});
 
router.get("/yourOrder", your_Order)
router.get("/user_account", user_account);

router.get('/choiceFilling', get_choice_filling)
router.post("/choiceFilling", choice_filling);
router.post('/cancelBookedSeat/:id', seat_canslation)
router.get(`/chooseLaunge/:id`, get_choose_lounge);

router.post("/choosen/:id", choose_lounge_id);

router.post("/payment", async (req, res) => {
  // Access the amount from the request body correctly
  const { amount } = req.body;

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // amount in the smallest currency unit (paise for INR)
      currency: "INR",
      receipt: "order_rcptid_11",
    });

    res.status(201).json({
      success: true,
      order,
      amount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error creating the order.",
    });
  }
});


router.get("/item/:id", particuler_item);

router.get("/forgot", (req, res) => {
  res.render("forgot", { error: "" });
});

// Function to send an OTP via email
async function sendOtpEmail(email, otpCode) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "khileshmaskare03@gmail.com",
        pass: "cerxgpsssmijkyil",
      },
    });

    const mailOptions = {
      from: "khileshmaskare03@gmail.com",
      to: email,
      subject: "Your OTP for Password Reset",
      text: `Your OTP code for password reset is: ${otpCode}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Route to send an OTP for password reset
router.post("/forgot", async (req, res) => {
  try {
    const userEmail = req.body.newemail;
    const user = await users.findOne({ email: userEmail });

    if (!user) {
      return res.status(401).render("forgot", { error: "Incorrect email!.." });
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

    res.render("otp", { userEmail, otpCode });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusText: "error",
      message: "An error occurred while processing your request.",
    });
  }
});

router.post("/otp", async (req, res, next) => {
  const otpCode = req.body.otpNumber;

  try {
    const otpData = await Otp.findOne({ code: otpCode });

    if (!otpData) {
      return res.status(400).redirect("/otp").json({
        statusText: "error",
        message: "Invalid OTP code",
      });
    }

    const currentTime = new Date().getTime();
    const diff = otpData.expireIn - currentTime;

    if (diff < 0) {
      return res.status(400).json({
        statusText: "error",
        message: "Token Expired",
      });
    }

    // If the OTP code is valid and not expired, render the 'reset-password' template
    res.render("reset-password", { otpData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusText: "error",
      message: "An error occurred while processing your request.",
    });
  }
});

router.post("/reset", async (req, res) => {
  const { email, newPassword, otpCode } = req.body;

  try {
    // Find the OTP data in your database
    const otpData = await Otp.findOne({ email, code: otpCode });

    if (!otpData || otpData.expireIn < new Date().getTime()) {
      const message = "The OTP has expired. Please request a new OTP.";
      return res.render("reset-password", { message, otpData });
    }

    // Find the user associated with the email in otpData
    const user = await users.findOne({ email });

    if (!user) {
      return res.status(400).json({
        statusText: "error",
        message: "User not found.",
      });
    }

    // Update the user's password with the new one
    user.password = newPassword;

    // Save the updated user data
    await user.save();

    // Delete the OTP data (since it's no longer needed)
    // await otpData.remove();

    res.redirect("/user_signin");
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusText: "error",
      message: "An error occurred while processing your request.",
    });
  }
});

module.exports = router;
