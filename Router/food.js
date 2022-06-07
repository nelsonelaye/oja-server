const express = require("express");
const router = express.Router();
const { foodImage } = require("../Utils/multer");
const {
  createFood,
  viewFood,
  viewOneFood,
  updateFood,
  updateFoodImage,
  deleteFood,
  foodUser,
} = require("../Controller/food");

router.route("/").get(viewFood);
router.post("/user/:userId", foodImage, createFood);
router.route("/:foodId").get(viewOneFood).patch(updateFood).delete(deleteFood);
router.patch("/:foodId/image", foodImage, updateFoodImage);
router.get("/:foodId/user/:userId", foodUser);

module.exports = router;
