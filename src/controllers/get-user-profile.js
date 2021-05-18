'use strict';

const Joi = require('joi');
const usersRepository = require('../repositories/users-repository');
const createJsonError = require('../errors/create-json-error');

async function getUserProfile(req, res) {
  try {
    const { HTTP_SERVER_DOMAIN, PATH_USER_IMAGE } = process.env;
    // Recogemos el Id del accessToken así no usamos ni tenemos que fiarnos de la URL
    const { id } = req.auth;
    const user = await usersRepository.findUserById(id);

    const image = `${HTTP_SERVER_DOMAIN}/${PATH_USER_IMAGE}/${user.image}`;

    const { nombre, email, rol, createdAt } = user;

    res.status(200);
    res.send({ nombre, email, rol, createdAt, image });
  } catch (err) {
    createJsonError(err, res);
  }
}

module.exports = { getUserProfile };

