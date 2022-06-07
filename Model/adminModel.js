const mongoose = require("mongoose");
const adminSchema = mongoose.Schema(
  {
    fullname: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    avatarId: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: true,
    },
    isVerify: {
      type: Boolean,
      default: true,
    },

    OTP: {
      type: String,
    },

    inputOTP: {
      type: String,
    },

    verifiedToken: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("admin", adminSchema);
