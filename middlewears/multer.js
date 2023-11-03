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