const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { authService, tokenService, userService } = require("../services");
const pick = require("../utils/pick");
const {
  generateHashedFromOtp,
  generateOtp,
  isMatchedOtp,
  errorMessage,
} = require("../utils/helpers");

const { aws } = require("../config/config");
const ApiError = require("../utils/ApiError");

exports.register = catchAsync(async (req, res) => {
  const user = await userService.register(req.body);
  res.status(httpStatus.CREATED).send({ user });
});

exports.loginByEmailAndPassword = catchAsync(async (req, res) => {
  const payload = pick(req.body, ["email", "password"]);
  const user = await authService.loginByEmailAndPassword(payload);
  const tokens = await tokenService.generateAuthTokens(user);

  res.status(httpStatus.ACCEPTED).send({ user, tokens });
});
