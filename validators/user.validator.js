const Joi = require("joi");
const { errorResponse } = require("../utils/api.response.js");

async function validateUserRegistration(req, res, next) {
  try {
    const schema = Joi.object({
      username: Joi.string().required().label('username'),
      phone: Joi.string().required().length(10).label('phone'),
      email: Joi.string().email().required().label('email'),
      password: Joi.string().min(6).required().label('password'),
    });

    const { error } = schema.validate(req.body);
    if (error) return errorResponse(error.details[0].message, res);

    return next();
  } catch (ex) {
    return errorResponse(ex.message, res);
  }
}

async function validateLogin(req, res, next) {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required().label("email"),
      password: Joi.string().min(6).required().label("password"),
    });

    const { error } = schema.validate(req.body);
    if (error) return errorResponse(error.details[0].message, res);

    return next();
  } catch (ex) {
    return errorResponse(ex.message, res);
  }
}

module.exports = {
  validateUserRegistration,
  validateLogin
};
