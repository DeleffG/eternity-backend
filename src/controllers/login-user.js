'use strict';

const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { login } = require('../repositories/users-repository');
const createJsonError = require('../errors/create-json-error');

const schema = Joi.object({
  username: Joi.alternatives().try(
    Joi.string().email(),
    Joi.string().alphanum().min(3).max(30)
  ).required(),
  password: Joi.string().min(4).max(20).required(),
});

async function loginUser(req, res) {
  try {
    const { body } = req;
    await schema.validateAsync(body);
    const { username, password } = body;

    // 1. Buscamos el usuario en la base de datos
    const user = await login(username, password);
    // 2. Validamos el usuario
    if ( !user ) {
      const error = new Error('No existe un usuario con ese nombre/contraseña.');
      error.status = 403;
      throw error;
    }
    const { id, nombre, rol, verifiedAt } = user;
    // 3. Comprobamos que la contraseña que nos están enviando es válida.
    const isValidPassword = await bcrypt.compare(password, user.password);
    if ( !isValidPassword ) {
      const error = new Error('No existe un usuario con ese nombre/contraseña');
      error.status = 403;
      throw error;
    }
    // 4. Comprobamos que su cuenta esta activa
    if ( !verifiedAt ) {
      const error = new Error('Verifique su cuenta para poder acceder a nuestros servicios');
      error.status = 401;
      throw error;
    }
    const { JWT_SECRET, JWT_SESSION_TIME } = process.env;
    // 5. generar el JWT
    const tokenPayload = { id, nombre, rol };
    const token = jwt.sign(
      tokenPayload,
      JWT_SECRET,
      { expiresIn: JWT_SESSION_TIME },
    );

    const response = {
      accessToken: token,
      expiresIn: JWT_SESSION_TIME,
    };

    res.status(200);
    res.send(response);
  } catch(error) {
    createJsonError(error, res);
  }
}

module.exports = { loginUser };