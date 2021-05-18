'use strict';

const Joi = require('joi');
const bcrypt = require('bcryptjs');
const cryptoRandomString = require('crypto-random-string');
const {
  getUserByEmail,
  udpateUserById,
  findUserById,
  addVerificationCode,
} = require('../repositories/users-repository');
const createJsonError = require('../errors/create-json-error');
const { sendEmailRegistration } = require('../helpers/mail-smtp');
const throwJsonError = require('../errors/throw-json-error');

const schema = Joi.object().keys({
  name: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string().optional(),
  repeatPassword: Joi.string().optional(),
});

const schemaPassword = Joi.object().keys({
  password: Joi.string().min(4).max(20).required(),
  repeatPassword: Joi.ref('password'),
});

async function updateUser(req, res) {
  try {
    const { id } = req.auth;


    //Validamos los datos del body
    const { body } = req;
    await schema.validateAsync(body);
    const { name, email, password, repeatPassword } = req.body;

    const userById = await findUserById(id);
    const user = await getUserByEmail(email);

    if (user && user.id !== id) {
      throwJsonError('Ya existe un usuario con ese email', 400);
    }

    let updatedPassword = userById.password;
    if (password) {
      await schemaPassword.validateAsync({ password, repeatPassword });
      const passwordHash = await bcrypt.hash(password, 12);

      updatedPassword = passwordHash;
    }

    if (email !== userById.email) {
      const verificationCode = cryptoRandomString({ length: 64 });
      await sendEmailRegistration(name, email, verificationCode);
      await addVerificationCode(id, verificationCode);
    }

    await udpateUserById({ id, name, email, password: updatedPassword });

    res.send({ id, name, email, role: userById.role });
  } catch (err) {
    createJsonError(err, res);
  }
}

module.exports = { updateUser };
