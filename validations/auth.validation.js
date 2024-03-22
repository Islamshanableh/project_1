const Joi = require("joi");

exports.loginByEmailAndPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required().max(320),
    password: Joi.string().required(),
  }),
};

exports.register = {
  body: Joi.object().keys({
    firstName: Joi.string().required().max(40),
    lastName: Joi.string().required().max(40),
    password: Joi.string().required(),
    email: Joi.string().required().email(),
    mobile: Joi.string().required(),
  }),
};
