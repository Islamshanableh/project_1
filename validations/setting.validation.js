const Joi = require('joi');

exports.create = {
  body: Joi.object().keys({
    title: Joi.string().required(),
  }),
  query: Joi.object().keys({
    id: Joi.number(),
  }),
};

exports.getById = {
  query: Joi.object().keys({
    id: Joi.number().required(),
  }),
};
