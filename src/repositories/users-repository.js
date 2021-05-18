'use strict';

const database = require('../infrastructure/database');

async function getUserByEmail(email) {
  const pool = await database.getPool();
  const consult = `SELECT id, email
  FROM users
  WHERE email = ?`;
  const [user] = await pool.query(consult, email);

  return user[0];
}
async function getUserByName(nombre) {
  const pool = await database.getPool();
  const consult = `SELECT nombre
  FROM users
  WHERE nombre = ?`;
  const [user] = await pool.query(consult, nombre);

  return user[0];
}
async function addUser(user) {
  const pool = await database.getPool();
  const now = new Date();
  const consult = `
    INSERT INTO users(
      nombre,
      email,
      password,
      verificationCode,
      rol,
      createdAt
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;
  const [created] = await pool.query(consult, [
    ...Object.values(user),
    'reader',
    now
  ]);

  return created.insertId;
}

async function activateValidation(verificationCode) {
  const now = new Date();

  const pool = await database.getPool();
  const updateQuery = `UPDATE users
    SET verifiedAt = ?
    WHERE verificationCode = ?
    AND verifiedAt IS NULL`;

  const [resultActivation] = await pool.query(updateQuery, [now, verificationCode]);

  return (resultActivation.affectedRows === 1);
}

async function getUserByVerificationCode(verificationCode) {
  const pool = await database.getPool();
  const consult = `SELECT nombre, email
  FROM users
  WHERE verificationCode = ?`;
  const [user] = await pool.query(consult, verificationCode);

  return user[0];
}

async function login(username) {
  const pool = await database.getPool();
  const consult = `SELECT id, nombre, rol, verifiedAt, password
    FROM users
    WHERE email = ? OR nombre = ?`;
  const [user] = await pool.query(consult, [username, username]);

  console.log(user);
  return user[0];
}


async function findUserById(id) {
  const pool = await database.getPool();
  const query = 'SELECT * FROM users WHERE id = ?';
  const [users] = await pool.query(query, id);

  return users[0];
}

async function udpateUserById(data) {
  const { id, name, email, password } = data;
  const pool = await database.getPool();
  const updateQuery = `UPDATE users
  SET name = ?, email = ?, password = ?
  WHERE id = ?`;
  await pool.query(updateQuery, [name, email, password, id]);

  return true;
}

async function findUserProfileImage(id) {
  const pool = await database.getPool();
  const query = 'SELECT image FROM users WHERE id = ?';
  const [users] = await pool.query(query, id);

  return users[0];
}

async function uploadUserProfileImage(id, image) {
  const pool = await database.getPool();
  const updateQuery = 'UPDATE users SET image = ? WHERE id = ?';
  await pool.query(updateQuery, [image, id]);

  return true;
}
async function addVerificationCode(id, code) {
  const now = new Date();
  const pool = await database.getPool();
  const insertQuery = `
    UPDATE INTO users SET verificationCode = ?,
    updatedAt = ?,
    verifiedAt = ?
    WHERE id = ?
  `;
  const [created] = await pool.query(insertQuery, [code, NULL, now, id]);

  return created.insertId;
}

module.exports = {
  activateValidation,
  addVerificationCode,
  addUser,
  findUserById,
  findUserProfileImage,
  getUserByEmail,
  getUserByName,
  getUserByVerificationCode,
  login,
  udpateUserById,
  uploadUserProfileImage,
};
