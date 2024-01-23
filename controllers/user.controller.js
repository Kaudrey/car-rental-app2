const { compare, hash } = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { Op } = require('sequelize');
const { sendWelcomeEmail } = require('../utils/emailConfig.js');
const {
  createSuccessResponse,
  errorResponse,
  serverErrorResponse,
  successResponse,
} = require('../utils/api.response.js');
const _ = require('lodash');

const pool = new Pool({
  host: process.env.HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

exports.registerUser = async (req, res) => {
  try {
    let checkEmailResult = await pool.query('SELECT * FROM users WHERE email = $1', [req.body.email]);
    let checkEmail = checkEmailResult.rows[0];

    if (checkEmail) return errorResponse('Email is already registered!', res);

    const saltRounds = 10;
    const hashedPassword = await hash(req.body.password, saltRounds);

    let createUserResult = await pool.query(
      'INSERT INTO users(username, phone, email, password) VALUES($1, $2, $3, $4) RETURNING *',
      [req.body.username, req.body.phone, req.body.email, hashedPassword]
    );

    let user = createUserResult.rows[0];

    try {
      await sendWelcomeEmail(user.email, user.username);
      return createSuccessResponse('User registered successfully. You can now login', {}, res);
    } catch (ex) {
      return errorResponse(ex.message, res);
    }
  } catch (ex) {
    return serverErrorResponse(ex, res);
  }
};

exports.login = async (req, res) => {
  try {
    let getUserResult = await pool.query('SELECT id,username,phone,email,password FROM users WHERE email = $1', [req.body.email]);
    let user = getUserResult.rows[0];

    if (!user) return errorResponse('Invalid email or password!', res);

    const validPassword = await compare(req.body.password, user.password);
    if (!validPassword) return errorResponse('Invalid email or password!', res);

    const token = jwt.sign({ _id: user.id}, process.env.JWT);

    return successResponse('Login successfully', { access_token: token }, res);
  } catch (ex) {
    console.log(ex);
    return serverErrorResponse(ex, res);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, phone, email, password } = req.body;

    const hashedPassword = password ? await hash(password, 10) : null;

    const updatedUserResult = await pool.query(
      'UPDATE users SET username = $1, phone = $2, email = $3, password = $4 WHERE id = $5 RETURNING *',
      [username, phone, email, hashedPassword, userId]
    );

    const updatedUser = updatedUserResult.rows[0];

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (ex) {
    return serverErrorResponse(ex, res);
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const authUserId = req.user._id;
    const { userId } = req.params;
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (authUserId !== userId) {
      return res
        .status(403)
        .json({ message: 'Permission denied. You can only delete your own account.' });
    }

    await pool.query('DELETE FROM posts WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    res.status(200).json({ message: 'User and associated posts removed from the system' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error removing user and associated posts from the system', error: error.message });
  }
};
exports.getUserSuggestions = async (req, res) => {
  try {
    const authUserId = req.user._id;
    const suggestedUsersResult = await pool.query(
      'SELECT id, username FROM users WHERE id != $1 LIMIT 5',
      [authUserId]
    );
    const suggestedUsers = suggestedUsersResult.rows;

    res.status(200).json({ suggestions: suggestedUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting user suggestions', error: error.message });
  }
};
