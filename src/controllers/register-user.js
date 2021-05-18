"use strict";
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const cryptoRandomString = require("crypto-random-string");

const createJsonError = require("../errors/create-json-error");
const { sendEmailRegistration } = require("../helpers/mail-smtp");
const {
  addUser,
  getUserByEmail,
  getUserByName,
} = require("../repositories/users-repository");

const schema = Joi.object({
  nombre: Joi.string().min(1).max(16).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(4).max(15).required(),
  repeatPassword: Joi.ref("password"),
});

async function registerUser(req, res) {
  try {
    const { body } = req;
    await schema.validateAsync(body);
    const { nombre, email, password } = body;
    const user = await getUserByEmail(email);
    console.log("user", user);
    if (user) {
      const error = new Error("Ya existe un usuario registrado con ese email.");
      error.status = 400;
      throw error;
    }
    const nick = await getUserByName(nombre);
    if (nick) {
      const error = new Error("Ya existe un usario registrado con ese nombre.");
      error.status = 400;
      throw error;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationCode = await cryptoRandomString({ length: 64 });
    const userDB = { nombre, email, passwordHash, verificationCode };
    const userId = await addUser(userDB);

    await sendEmailRegistration(nombre, email, verificationCode);

    res.status(200);
    res.send({ userId });
  } catch (error) {
    createJsonError(error, res);
  }
}

module.exports = { registerUser };
