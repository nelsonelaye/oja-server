const express = require("express");
const { avatar, foodImage } = require("../Utils/multer");
const authUser = require("../Utils/authorize");
const router = express.Router();
const {
  getAllUser,
  getOneUser,
  createUser,
  verifyUser,
  signInUser,
  deleteUser,
  populateOrders,
} = require("../Controller/user");

const {
  createFood,
  viewFood,
  viewOneFood,
  updateFood,
  updateFoodImage,
  deleteFood,
  foodUser,
} = require("../Controller/food");

router.route("/").get(getAllUser).post(avatar, createUser);

router.post("/signin", signInUser);

router.route("/:userId").get(getOneUser).delete(authUser, deleteUser);
router.route("/:userId/token/:token").get(verifyUser);

//food routes
router.route("/:userId/food").get(viewFood).post(foodImage, createFood);

router.get("/:userId/food/orders", populateOrders);
router
  .route("/:userId/food/:foodId")
  .get(viewOneFood)
  .patch(authUser, updateFood)
  .delete(authUser, deleteFood);

router
  .route("/:userId/food/:foodId/image")
  .patch(authUser, foodImage, updateFoodImage);
module.exports = router;
