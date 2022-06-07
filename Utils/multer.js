const multer = require("multer");
const path = require("path");

const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "Avatars");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const foodStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "FoodImages");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const avatar = multer({ storage: avatarStorage }).single("avatar");
const foodImage = multer({ storage: foodStorage }).single("image");

module.exports = { avatar, foodImage };
