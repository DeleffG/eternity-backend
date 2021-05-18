"use strict";

const nodemailer = require("nodemailer");

const {
  HTTP_SERVER_DOMAIN,
  SMTP_PORT,
  SMTP_HOST,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
} = process.env;

const transporter = nodemailer.createTransport({
  port: SMTP_PORT,
  host: SMTP_HOST,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  secure: false,
});

async function sendEmailRegistration(name, email, verificationCode) {
  const linkActivation = `${HTTP_SERVER_DOMAIN}/users/activation?verification_code=${verificationCode}`;
  console.log(linkActivation);

  const mailData = {
    from: SMTP_FROM,
    to: email,
    subject: "¡Bienvenido a Eternity!",
    text: `Hola ${name}, para confirmar la cuenta haz click aquí: ${linkActivation}`,
    html: `Hola ${name}, para confirmar la cuenta <a href="${linkActivation}">haz click aquí</a>`,
  };
  console.log("mailData", mailData);
  const data = await transporter.sendMail(mailData);

  return data;
}

async function sendEmailCorrectValidation(name, email) {
  const mailData = {
    from: SMTP_FROM,
    to: email,
    subject: "¡La cuenta en [Eternity] ha sido activada!",
    text: `Hola ${name},\n tu cuenta ha sido activada. ¡Disfruta de nuestra red social!`,
    html: `<p>Hola ${name},</p><p>tu cuenta ha sido activada. ¡Disfruta de nuestra red social!</p>`,
  };

  const data = await transporter.sendMail(mailData);

  return data;
}

module.exports = {
  sendEmailRegistration,
  sendEmailCorrectValidation,
};
