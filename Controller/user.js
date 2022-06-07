const userModel = require("../Model/userModel");
const foodModel = require("../Model/foodModel");
const verifiedModel = require("../Model/verifiedModel");
const cloudinary = require("../Utils/cloudinary");
const transport = require("../Utils/email");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const getAllUser = async (req, res) => {
  try {
    const user = await userModel.find();
    res.status(200).json({
      message: "success",
      data: user,
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

const getOneUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.userId);
    res.status(200).json({
      message: "success",
      data: user,
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    //secure passsword
    const salt = await bcrypt.genSalt(15);
    const hashed = await bcrypt.hash(password, salt);

    //upload image to cloud
    const result = await cloudinary.uploader.upload(req.file.path);

    //gen token
    const genToken = crypto.randomBytes(64).toString("hex");
    const token = await jwt.sign({ genToken }, process.env.SECRET, {
      expiresIn: process.env.EXPIRES,
    });

    //create the user
    const user = await userModel.create({
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
      userId: user._id,
    });

    //send verification mail
    const mailOptions = {
      from: "no-reply@gmail.com",
      to: email,
      subject: "Account Verification",
      html: `
        <p>Hello, ${fullname}, please confirm your account registeration with <b>Oja</b></p>
        <p> <a href="http://localhost:1101/api/user/${user._id}/token/${token}">Yes, confrim my email address</a></p>
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
      data: user,
      // message: "Please, check Your inbox to confirm your account.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const verifyUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.userId);

    if (user) {
      if (user.verifiedToken !== "") {
        await userModel.findByIdAndUpdate(
          user._id,
          {
            _id: user._id,
            isVerify: true,
            verifiedToken: "",
          },
          { new: true }
        );

        await verifiedModel.findByIdAndUpdate(
          user._id,
          { userId: user._id, token: "" },
          { new: true }
        );

        res.status(201).json({
          message: "Thank you! Now proceed to login.",
        });
      } else {
        res.status(500).json({
          message:
            "You are not verified yet. Check your inbox for confirmation link",
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

const signInUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    //find user in database/registerd
    if (user) {
      //Check for password
      const check = await bcrypt.compare(password, user.password);
      if (check) {
        //Check if verified
        if (user.isVerify) {
          //create token for user data
          const token = jwt.sign(
            {
              _id: user._id,
              isVerify: user.isVerify,
            },
            process.env.SECRET,
            { expiresIn: process.env.EXPIRES }
          );

          const { password, ...rest } = user._doc;

          //send welcome mail
          const mailOptions = {
            from: "no-reply@gmail.com",
            to: email,
            subject: "Welcome to Oja",
            html: `<h1>Hello ${user.fullname},</h1><p>We are glad to have you here. we look forward to offering you the best services in this market.</p>`,
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

          //re-send verification mail
          const mailOptions = {
            from: "no-reply@gmail.com",
            to: email,
            subject: "Re-verification of account",
            html: `<p>Please confirm your account registeration with <b>Oja</b></p>
            <p> <a href="http://localhost:1101/api/user/${user._id}/${token}">Yes, confrim my email address</a></p>
            <p>if you did not make this subscription request, please ignore this message. You will not be signed up unless you click the confirmation link above.</p>>`,
          };

          // await transport.sendMail(mailOptions, (err, info) => {
          //   if (err) {
          //     console.log(err.message);
          //   } else {
          //     console.log("Email sent to inbox", info);
          //   }
          // });

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
        message: "User not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error,
    });
  }
};

const populateOrders = async (req, res) => {
  try {
    let user = await userModel.findById(req.params.userId);
    if (user) {
      if (user.isAdmin) {
        orders = await foodModel.find();
        res.status(200).json({
          status: "Success",
          data: orders,
        });
      } else {
        orders = await userModel.findById(req.params.userId).populate("orders");
        res.status(200).json({
          status: "Success",
          data: orders,
        });
      }
    } else {
      res.status(404).json({
        message: "User not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.userId);

    if (user) {
      await userModel.findByIdAndDelete(req.params.userId);

      res.status(204).json({
        status: "Success",
        message: "Account deleted",
      });
    } else {
      res.status(404).json({
        status: "Failed",
        message: "User not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

// const viewOrders = async (req, res) => {
//   try {
//     const user = await userModel.findById(req.params.userId);

//     if (user) {
//       if (user.isAdmin) {

//       } else {
//         res.status(500).json({

//           message: "You cannot access this page",
//         });
//       }
//     } else {
//       res.status(404).json({
//         message: "User not found",
//       });
//     }
//   } catch (err) {
//     res.status(404).json({
//       status: "Failed",
//       message: error.message,
//     });
//   }
// };
module.exports = {
  getAllUser,
  getOneUser,
  createUser,
  verifyUser,
  signInUser,
  deleteUser,
  populateOrders,
};
