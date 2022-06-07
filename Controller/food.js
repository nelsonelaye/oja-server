const foodModel = require("../Model/foodModel");
const userModel = require("../Model/userModel");
const cloudinary = require("../Utils/cloudinary");
const mongoose = require("mongoose");
const createFood = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.userId);
    const { title, description, price, qty } = req.body;

    if (user) {
      // const result = await cloudinary.uploader.upload(req.file.path);

      const food = await new foodModel({
        title,
        description,
        price,
        qty,
        image:
          "https://res.cloudinary.com/dzc9ivqeh/image/upload/v1654301232/joseph-gonzalez-zcUgjyqEwe8-unsplash_e5smuq.jpg",
        imageId: "joseph-gonzalez-zcUgjyqEwe8-unsplash_e5smuq",
      });

      food.user = user;
      food.save();

      user.orders.push(mongoose.Types.ObjectId(food._id));
      user.save(200);

      res.status(201).json({
        status: "Success",
        data: food,
      });
    } else {
      res.status(404).json({
        status: "Failed",
        message: "user not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

const viewFood = async (req, res) => {
  try {
    const food = await foodModel.find();

    res.status(200).json({
      status: "Success",
      data: food,
    });
  } catch (error) {
    res.status(404).json({
      status: "Failed",
      message: error.message,
    });
  }
};

const viewOneFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.params.foodId);
    res.status(200).json({
      status: "Success",
      data: food,
    });
  } catch (error) {
    res.status(404).json({
      status: "Failed",
      message: error.message,
    });
  }
};

const updateFood = async (req, res) => {
  try {
    const foodId = req.params.foodId;
    const food = await foodModel.findById(foodId);
    if (food) {
      const { title, description, price, qty } = req.body;

      const newFood = await foodModel.findByIdAndUpdate(foodId, req.body, {
        new: true,
      });
      res.status(200).json({
        status: "Success",
        data: newFood,
      });
    } else {
      res.status(404).json({
        message: " USer not found",
      });
    }
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message,
    });
  }
};

const updateFoodImage = async (req, res) => {
  try {
    const foodId = req.params.foodId;
    const food = await foodModel.findById(foodId);
    if (food) {
      await cloudinary.uploader.destroy(food.imageId);
      const result = await cloudinary.uploader.upload(req.file.path);
      const newFood = await foodModel.findByIdAndUpdate(
        foodId,
        { image: result.secure_url, imageId: result.public_id },
        { new: true }
      );

      res.status(200).json({
        status: "Success",
        data: newFood,
      });
    } else {
      res.status(404).json({
        message: " USer not found",
      });
    }
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message,
    });
  }
};

const deleteFood = async (req, res) => {
  try {
    const foodId = req.params.foodId;
    const food = await foodModel.findById(foodId);
    if (food) {
      const user = await userModel.findById(req.params.userId);
      if (user) {
        await user.orders.pull(food);
        user.save();
        await foodModel.findByIdAndDelete(foodId);
        res.status(204).json({
          status: "Success",
          message: "Food item deleted",
        });
      } else {
        res.status(404).json({
          message: " USer not found",
        });
      }
    } else {
      res.status(404).json({
        message: "Food Item not found",
      });
    }
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message,
    });
  }
};

const foodUser = async (req, res) => {
  try {
    let food = await foodModel.findById(req.params.foodId);
    if (food) {
      const user = await userModel.findById(req.params.userId);
      if (user) {
        food = await foodModel.findById(req.params.foodId).populate("user");
        res.status(200).json({
          status: "Success",
          data: food,
        });
      } else {
        res.status(404).json({
          message: "User not found",
        });
      }
    } else {
      res.status(404).json({
        message: "Food item not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

module.exports = {
  createFood,
  viewFood,
  viewOneFood,
  updateFood,
  updateFoodImage,
  deleteFood,
  foodUser,
};
