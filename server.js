const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./Utils/db");
// require("./Utils/atlas");

const app = express();
const port = process.env.PORT || 1101;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Oja",
  });
});
app.use("/api/user", require("./Router/user"));
// app.use("/api/admin", require("./Router/admin"));

app.listen(port, () => {
  console.log("Running...", port);
});
