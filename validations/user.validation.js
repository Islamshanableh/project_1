const Joi = require('joi');

exports.userList = {
  query: Joi.object().keys({
    status: Joi.string().required(),
  }),
};

exports.getById = {
  query: Joi.object().keys({
    id: Joi.number().required(),
  }),
};

exports.update = {
  body: Joi.object().keys({
    firstName: Joi.string(),
    lastName: Joi.string(),
    mobile: Joi.string(),
    email: Joi.string().email().max(320),
  }),
};

exports.approveUser = {
  body: Joi.object().keys({
    id: Joi.number().required(),
    role: Joi.string().required().valid('ADMIN', 'USER'),
    sectionsIds: Joi.array().items(Joi.number().required()).required(),
  }),
};
