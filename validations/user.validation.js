const Joi = require("joi");
const constants = require("../constants/service.constants");
const myCustomJoi = Joi.extend(require("joi-phone-number"));

const pattern = /^(?=.*[a-z])(?=.*\d)[A-Za-z\d[\]{};:=<>_+^#$@!%*?&]{8,64}$/;

exports.userList = {
  body: Joi.object().keys({
    filter: Joi.object().keys({
      dateRange: {
        createdAtFrom: Joi.date().less("now").required(),
        createdAtTo: Joi.date().min(Joi.ref("createdAtFrom")).required(),
      },
      isActive: Joi.boolean(),
      type: Joi.string(),
      userId: Joi.number(),
      isBlocked: Joi.boolean(),
    }),
    search: Joi.alternatives().try(Joi.string(), Joi.number()), // Accept both numbers and strings
    searchField: Joi.string(),
    sort: Joi.object().keys({
      field: Joi.string().required(),
      descAsc: Joi.string().required(),
    }),
  }),
  query: Joi.object().keys({
    skip: Joi.number().required(),
    take: Joi.number().required(),
    draw: Joi.number().required(),
  }),
};

exports.findUserIdentifications = {
  param: Joi.object().keys({
    id: Joi.number().required(),
  }),
  query: Joi.object().keys({
    skip: Joi.number().required(),
    take: Joi.number().required(),
    draw: Joi.number().required(),
    search: Joi.string(),
  }),
};

exports.getUserCurrentPlan = {
  params: Joi.object().keys({
    id: Joi.number().required(),
  }),
};

exports.update = {
  body: Joi.object().keys({
    firstName: Joi.string(),
    lastName: Joi.string(),
    countryId: Joi.string().length(3),
    address: Joi.string().empty(),
  }),
};

exports.block = {
  body: Joi.object().keys({
    userId: Joi.number().required(),
    isBlocked: Joi.boolean().required(),
  }),
};

exports.contact = {
  body: Joi.object().keys({
    subject: Joi.string().required(),
    message: Joi.string(),
  }),
};

exports.reportUser = {
  body: Joi.object().keys({
    itemId: Joi.number(),
    reason: Joi.string().max(200),
    explanation: Joi.string().max(200),
    reportedUserId: Joi.number().required(),
    reportOn: Joi.string().required(),
    feedback: Joi.string().required(),
    accurateRating: Joi.number().integer().min(1).max(5),
    shippingCostRating: Joi.number().integer().min(1).max(5),
    shippingSpeedRating: Joi.number().integer().min(1).max(5),
    communicationRating: Joi.number().integer().min(1).max(5),
  }),
};

exports.addNewDeviceToken = {
  body: Joi.object().keys({
    deviceId: Joi.string().required(),
    deviceType: Joi.string().valid("IOS", "ANDROID"),
  }),
};

exports.removeDeviceToken = {
  query: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

exports.updatePaypalInfo = {
  body: Joi.object().keys({
    code: Joi.string().required(),
  }),
};

exports.getPaypalInfo = {
  query: Joi.object().keys({}),
  body: Joi.object().keys({}),
};

exports.resetPassword = {
  body: Joi.object().keys({
    id: Joi.number().required(),
  }),
};

exports.sellingLimit = {
  query: Joi.object().keys({
    userId: Joi.number().min(0),
  }),
};

exports.sellingLimitUpdate = {
  query: Joi.object().keys({
    userId: Joi.number().min(0),
    limit: Joi.number().min(0).required().default(0),
  }),
};

// ADMIN ***************************
exports.workersList = {
  body: Joi.object().keys({
    filter: Joi.object().keys({
      dateRange: {
        createdAtFrom: Joi.date().less("now").required(),
        createdAtTo: Joi.date().min(Joi.ref("createdAtFrom")).required(),
      },
      isActive: Joi.boolean(),
      type: Joi.string().valid("WORKER", "ADMIN"),
      userId: Joi.number(),
    }),
    search: Joi.string(),
    searchField: Joi.string().valid("fullName", "email", "username"),
    sort: Joi.object().keys({
      field: Joi.string().required(),
      descAsc: Joi.string().required(),
    }),
  }),
  query: Joi.object().keys({
    skip: Joi.number().required(),
    take: Joi.number().required(),
    draw: Joi.number().required(),
  }),
};

exports.FindWorkerById = {
  body: Joi.object().keys({ id: Joi.string().required() }),
};

exports.blockWorker = {
  body: Joi.object().keys({
    id: Joi.number().required(),
    isBlocked: Joi.boolean().required(),
  }),
};

exports.deactivateWorker = {
  body: Joi.object().keys({
    id: Joi.number().required(),
    isActive: Joi.boolean().required(),
  }),
};

exports.updateWorker = {
  body: Joi.object().keys({
    id: Joi.number().required(),
    firstName: Joi.string()
      .pattern(/^\s*$/, { invert: true })
      .custom((str) => str.trim()),
    lastName: Joi.string()
      .pattern(/^\s*$/, { invert: true })
      .custom((str) => str.trim()),
    role: Joi.string(),
    email: Joi.string(),
  }),
};
// user validations V

exports.completeUserDetails = {
  body: Joi.object().keys({
    firstName: Joi.string().required().max(65),
    lastName: Joi.string().required().max(65),
    username: Joi.string().required().max(65),
    address: Joi.string().empty().required().max(100),
    countryId: Joi.string().required(),
  }),
};

exports.changePassword = {
  body: Joi.object().keys({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string()
      .required()
      .regex(RegExp(pattern))
      .message("fails to match the password required pattern")
      .min(8)
      .max(64),
  }),
};

exports.FindUserById = {
  query: Joi.object().keys({ id: Joi.number() }),
};

exports.likeItem = {
  body: Joi.object().keys({
    catalogId: Joi.string(),
    itemId: Joi.number().positive(),
    action: Joi.string().required().valid("LIKE", "UNLIKE"),
  }),
};

exports.sendHelpEmail = {
  body: Joi.object().keys({
    subject: Joi.string().required(),
    message: Joi.string().required(),
  }),
};

exports.sendHelpEmailWithoutToken = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    phone: myCustomJoi
      .string()
      .phoneNumber({ format: "international", strict: true }),
    email: Joi.string().email().required().max(320),
    subject: Joi.string().required(),
    message: Joi.string().required(),
  }),
};
exports.selectLanguage = {
  query: Joi.object().keys({
    lang: Joi.string().valid("EN", "HE").required(),
    deviceId: Joi.string().required(),
  }),
};

exports.onOffNotificationUser = {
  body: Joi.object().keys({
    isActive: Joi.boolean().required(),
  }),
};
