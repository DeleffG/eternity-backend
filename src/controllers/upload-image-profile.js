'use strict';

const cryptoRandomString = require('crypto-random-string');
const createJsonError = require('../errors/create-json-error');
const path = require('path');
const fs = require('fs');
const {
  findUserProfileImage,
  uploadUserProfileImage,
} = require('../repositories/users-repository');
const throwJsonError = require('../errors/throw-json-error');


const validExtensions = ['.jpeg', '.jpg', '.png'];

async function uploadImageProfile(req, res) {
  try {
    // Obtenemos el id del JWT
    const { id } = req.auth;

    const { files } = req;
    if (!files || Object.keys(files).length === 0) {
      throwJsonError('No se ha seleccionado ningún fichero', 400);
    }

    const { profileImage } = files;
    const extension = path.extname(profileImage.name);

    if (!validExtensions.includes(extension)) {
      throwJsonError('Formato no valido', 400);
    }

    const { HTTP_SERVER_DOMAIN, PATH_USER_IMAGE } = process.env;
    // Cogemos la imagen de perfil original
    const user = await findUserProfileImage(id);
    // Generamos la ruta completa a la carpeta donde situamos las imagenes de perfil
    const pathProfileImageFolder = `${__dirname}/../../../public/${PATH_USER_IMAGE}`;

    // Borramos la imagen original si existe
    if (user.image) {
      await fs.unlink(`${pathProfileImageFolder}/${user.image}`, () => {
        console.log('Se ha borrado correctamente la imagen.');
      });
    }

    const random = cryptoRandomString({ length:10, type: 'alphanumeric' });
    const imageName = `${id}-${random}${extension}`;
    // Path de la nueva imagen de perfil
    const pathImage = `${pathProfileImageFolder}/${imageName}`;

    // Movemos la image a la ruta final /public/images/profiles/
    profileImage.mv(pathImage, async function (err) {
      if (err) return res.status(500).send(err);
      await uploadUserProfileImage(id, imageName);

      res.send({ url: `${HTTP_SERVER_DOMAIN}/${PATH_USER_IMAGE}/${imageName}` });
    });
  } catch (err) {
    createJsonError(err, res);
  }
}

module.exports = { uploadImageProfile };
