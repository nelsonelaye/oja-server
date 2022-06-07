const express = require("express");
const { avatar } = require("../Utils/multer");
const authUser = require("../Utils/authorize");
const router = express.Router();
const {
  getAllAdmin,
  getOneAdmin,
  createAdmin,
  verifyAdmin,
  signInAdmin,
  deleteAdmin,
} = require("../Controller/admin");

const { deleteFood } = require("../Controller/food");

router.route("/").get(getAllAdmin).post(avatar, createAdmin);

router.post("/signin", signInAdmin);
router.route("/:adminId").get(getOneAdmin).delete(authUser, deleteAdmin);
router.route("/:adminId/:token").get(verifyAdmin);

//i need to pull the food out of the user
router.delete("/user/:userId/food/:foodId", authUser, deleteFood);
module.exports = router;
