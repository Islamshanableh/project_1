const Joi = require('joi');

exports.createTicket = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    fields: Joi.object(),
    userId: Joi.number(),
    sectionId: Joi.number().required(),
    files: Joi.array(),
  }),
};

exports.getById = {
  query: Joi.object().keys({
    id: Joi.number().required(),
  }),
};

exports.update = {
  body: Joi.object().keys({
    id: Joi.number().required(),
    title: Joi.string(),
    fields: Joi.object(),
    userId: Joi.number(),
    sectionId: Joi.number(),
    files: Joi.array(),
  }),
};

exports.createComment = {
  body: Joi.object().keys({
    content: Joi.string().required(),
    ticketId: Joi.number().required(),
  }),
};

exports.updateComment = {
  body: Joi.object().keys({
    content: Joi.string().required(),
    commentId: Joi.number().required(),
  }),
};
