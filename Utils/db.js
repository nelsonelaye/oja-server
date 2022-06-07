const mongoose = require("mongoose");
require("dotenv").config();

const url = process.env.ATLAS_OLD;

mongoose
  .connect(url)
  .then(() => {
    console.log("Hala Atlas");
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = mongoose;
