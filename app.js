const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
var path  = require('path');
var cookieParser = require('cookie-parser');
var createError = require('http-errors');

// env file
require('dotenv').config({path: "./.env"});

// connect Database
require('./models/database').connectDataBase();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// logger
const logger = require('morgan')
app.use(logger("tiny"))

// body parser
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// cookieParse
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Get /
app.use("/", require('./router/indexRouter'));
app.use("/lounge", require('./router/loungeRouter'))
app.use("/shop", require('./router/shopRouter'))






app.all("*", (req, res, next)=>{
    res.send("lucky error");
})


app.listen(process.env.PORT, console.log(`server listen in port ${process.env.PORT}`));
