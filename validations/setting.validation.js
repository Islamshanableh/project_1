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

exports.updateSection = {
  body: Joi.object().keys({
    title: Joi.string(),
    order: Joi.number().min(3),
  }),
  query: Joi.object().keys({
    id: Joi.number(),
  }),
};

exports.update = {
  body: Joi.object().keys({
    title: Joi.string(),
    order: Joi.number(),
  }),
  query: Joi.object().keys({
    id: Joi.number(),
  }),
};
