"use strict";
const createJsonError = require("../errors/create-json-error");
const {
  activateValidation,
  getUserByVerificationCode,
} = require("../repositories/users-repository");
const { sendEmailCorrectValidation } = require("../helpers/mail-smtp");

async function activateUser(req, res) {
  try {
    const { verification_code: verificationCode } = req.query;

    if (!verificationCode) {
      return res.status(400).json({
        message: "Código de activación inválido.",
      });
    }

    const isActivated = await activateValidation(verificationCode);

    if (!isActivated) {
      res.send({
        message: "La cuenta no ha sido activada.",
      });
    }

    const user = await getUserByVerificationCode(verificationCode);
    const { nombre, email } = user;
    await sendEmailCorrectValidation(nombre, email);

    res.send({ message: "La cuenta ha sido activada." });
  } catch (error) {
    createJsonError(error, res);
  }
}

module.exports = { activateUser };
