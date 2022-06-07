const nodemailer = require("nodemailer");
require("dotenv").config();

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nelsonmicheal51@gmail.com",
    pass: "swiped.@",
  },
});

module.exports = transport;
