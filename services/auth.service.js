const bcrypt = require("bcryptjs");
const httpStatus = require("http-status");
const { prisma } = require("./prisma.service");
const tokenService = require("./token.service");
const userService = require("./user.service");
const ApiError = require("../utils/ApiError");
const { auth } = require("../constants/service.constants");

const getUserDetail = async (payload) => {
  const user = await prisma.user.findUnique({
    where: {
      ...payload,
    },
  });

  if (user) {
    return user;
  }

  return new ApiError(httpStatus.NOT_FOUND, { message: "user not found" });
};

exports.loginByEmailAndPassword = async ({ email, password }) => {
  const user = await getUserDetail({ email });

  if (!user)
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password");

  const isPasswordMatched = bcrypt.compareSync(password, user.password);

  if (!isPasswordMatched)
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "invalid username/email or password",
      [{ context: { key: "password" }, message: "Invalid email or password" }]
    );

  delete user.password;
  return user;
};

exports.refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(
      refreshToken,
      auth.tokenTypes.REFRESH
    );

    const user = await userService.findUserById(refreshTokenDoc.sub);

    if (!user) {
      throw new Error(httpStatus.UNAUTHORIZED, "Please Authenticate");
    }

    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
  }
};
