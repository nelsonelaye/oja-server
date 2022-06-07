const mongoose = require("mongoose");
const foodSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    price: {
      type: Number,
    },
    qty: {
      type: Number,
    },
    image: {
      type: String,
    },
    imageId: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    // admin: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "users",
    // },
  },
  { timestamps: true }
);

module.exports = mongoose.model("foods", foodSchema);
