"use strict";

require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const fileUpload = require("express-fileupload");
const app = express();

const usersRouter = require("./app/routes/users-routes");

const port = process.env.SERVER_PORT || 3008;

// LOG con Morgan
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "./access.log"),
  { flags: "a" }
);
app.use(morgan("combined", { stream: accessLogStream }));

app.use("/users/", usersRouter);

app.listen(port, () => console.log(`Escuchando puerto ${port}`));
