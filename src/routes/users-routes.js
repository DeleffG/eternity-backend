"use strict";

const express = require("express");
const router = express.Router();
const { activateUser } = require("../controllers/activation-account");
const { loginUser } = require("../controllers/login-user");
const { registerUser } = require("../controllers/register-user");
const { updateUser } = require("../controllers/update-user");
const { uploadImageProfile } = require("../controllers/upload-image-profile");
const { getUserProfile } = require("../controllers/get-user-profile");
const validateAuth = require("../middlewares/validate-auth");

//Publicas
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/activation").get(activateUser);

//Privadas
router.route("/").all(validateAuth).put(updateUser);
router.route("/:id").all(validateAuth);
router.route("/profile").all(validateAuth).get(getUserProfile);
router.route("/upload").all(validateAuth).post(uploadImageProfile);

module.exports = router;
