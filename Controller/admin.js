const adminModel = require("../Model/adminModel");
const foodModel = require("../Model/foodModel");
const verifiedModel = require("../Model/verifiedModel");
const cloudinary = require("../Utils/cloudinary");
const transport = require("../Utils/email");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const getAllAdmin = async (req, res) => {
  try {
    const admin = await adminModel.find();
    res.status(200).json({
      message: "success",
      data: admin,
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

const getOneAdmin = async (req, res) => {
  try {
    const admin = await adminModel.findById(req.params.adminId);
    res.status(200).json({
      message: "success",
      data: admin,
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

const createAdmin = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    //secure passsword
    const salt = await bcrypt.genSalt(15);
    const hashed = await bcrypt.hash(password, salt);

    //upload image to cloud
    const result = await cloudinary.uploader.upload(req.file.path);

    //gen token and OTP for verification
    const genToken = crypto.randomBytes(64).toString("hex");

    const token = await jwt.sign({ genToken }, process.env.SECRET, {
      expiresIn: process.env.EXPIRES,
    });

    //create the admin
    const admin = await adminModel.create({
      fullname,
      email,
      password: hashed,
      verifiedToken: token,
      avatar: result.secure_url,
      avatarId: result.public_id,
    });

    //save the token for reference and verification
    await verifiedModel.create({
      token: token,
      adminId: admin._id,
    });

    //send verification mail
    const mailOptions = {
      from: "no-reply@gmail.com",
      to: email,
      subject: "Account Verification",
      html: `
      
      <p>Hello, ${fullname}, please confirm your account registeration with <b>Oja</b></p>
      <p> <a href="http://localhost:1101/api/admin/${admin._id}/${token}">Yes, confrim my email address</a></p>
      <p>if you did not make this subscription request, please ignore this message. You will not be signed up unless you click the confirmation link above.</p>
      `,
    };

    // await transport.sendMail(mailOptions, (err, info) => {
    //   if (err) {
    //     console.log(err.message);
    //   } else {
    //     console.log("Email sent to inbox", info);
    //   }
    // });

    res.status(201).json({
      status: "Success",
      data: admin,
      // message: "Please, check Your inbox to confirm your account.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const verifyAdmin = async (req, res) => {
  try {
    const admin = await adminModel.findById(req.params.adminid);

    if (admin) {
      if (admin.verifiedToken !== "") {
        await adminModel.findByIdAndUpdate(
          admin._id,
          {
            isVerify: true,
            verifiedToken: "",
            OTP: "",
          },
          { new: true }
        );

        await verifiedModel.findByIdAndUpdate(
          admin._id,
          { adminId: admin._id, token: "" },
          { new: true }
        );

        res.status(201).json({
          message: "Thank you! Now proceed to login.",
        });
      } else {
        res.status(500).json({
          message: "You are not verified yet.",
        });
      }
    } else {
      res.status(404).json({
        message: "Sorry, you cannot access this page.",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const signInAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await adminModel.findOne({ email });

    //find admin in database/registerd
    if (admin) {
      //Check for password
      const check = await bcrypt.compare(password, admin.password);
      if (check) {
        //Check if verified
        if (admin.isVerify) {
          //create token for admin data
          const token = jwt.sign(
            {
              _id: admin._id,
              isVerify: admin.isVerify,
            },
            process.env.SECRET,
            { expiresIn: process.env.EXPIRES }
          );

          const { password, ...rest } = admin._doc;

          //send welcome mail
          const mailOptions = {
            from: "no-reply@gmail.com",
            to: email,
            subject: "Welcome to Oja",
            html: `<h1>Hello ${admin.fullname},</h1><p>We are glad to have you here. we look forward to offering you the best services in this market.</p>`,
          };

          // await transport.sendMail(mailOptions, (err, info) => {
          //   if (err) {
          //     console.log(err.message);
          //   } else {
          //     console.log("Email sent to inbox", info);
          //   }
          // });

          res.status(200).json({
            status: "Success",
            data: { token, ...rest },
          });
        } else {
          //gen token for verification
          const genToken = crypto.randomBytes(64).toString("hex");
          const token = await jwt.sign({ genToken }, process.env.SECRET, {
            expiresIn: process.env.EXPIRES,
          });

          //send verification mail
          const mailOptions = {
            from: "no-reply@gmail.com",
            to: email,
            subject: "Re-verification of account",
            html: `<p>Please confirm your account registeration with <b>Oja</b></p>
            <p> <a href="http://localhost:1101/api/admin/${admin._id}/${token}">Yes, confrim my email address</a></p>
            <p>if you did not make this subscription request, please ignore this message. You will not be signed up unless you click the confirmation link above.</p>>`,
          };

          await transport.sendMail(mailOptions, (err, info) => {
            if (err) {
              console.log(err.message);
            } else {
              console.log("Email sent to inbox", info);
            }
          });

          res.status(201).json({
            message: "You are not verified yet. Email confirmation link resent",
          });
        }
      } else {
        res.status(200).json({
          message: "Password is incorrect",
        });
      }
    } else {
      res.status(404).json({
        message: "admin not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const adminId = req.params.adminId;
    const admin = await adminModel.findById(adminId);
    if (admin) {
      await adminModel.findByIdAndDelete(adminId);
      res.status(204).json({
        status: "Success",
        message: "admin  deleted",
      });
    } else {
      res.status(404).json({
        message: " admin not found",
      });
    }
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message,
    });
  }
};

// const deleteFood = async (req, res) => {
//   try {
//     const foodId = req.params.foodId;
//     const food = await foodModel.findById(foodId);
//     if (food) {
//       const user = await adminModel.findById(req.params.adminId);
//       if (user) {
//         await user.orders.pull(food);
//         user.save();
//         await foodModel.findByIdAndDelete(foodId);
//         res.status(204).json({
//           status: "Success",
//           message: "Food item deleted",
//         });
//       } else {
//         res.status(404).json({
//           message: " USer not found",
//         });
//       }
//     } else {
//       res.status(404).json({
//         message: "Food Item not found",
//       });
//     }
//   } catch (error) {
//     res.status(400).json({
//       status: "Failed",
//       message: error.message,
//     });
//   }
// };
module.exports = {
  getAllAdmin,
  getOneAdmin,
  createAdmin,
  verifyAdmin,
  signInAdmin,
  deleteAdmin,
};
