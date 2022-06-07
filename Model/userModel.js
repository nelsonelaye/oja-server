const mongoose = require("mongoose");
const userModel = mongoose.Schema(
  {
    fullname: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
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
    isVerify: {
      type: Boolean,
      default: true,
    },
    isAdmin: {
      type: Boolean,
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "foods",
      },
    ],
    verifiedToken: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", userModel);
