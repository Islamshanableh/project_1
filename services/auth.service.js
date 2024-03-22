const bcrypt = require('bcryptjs');
const httpStatus = require('http-status');
const { prisma } = require('./prisma.service');
const tokenService = require('./token.service');
const userService = require('./user.service');
const ApiError = require('../utils/ApiError');
const { auth } = require('../constants/service.constants');

const getUserDetail = async payload => {
  const user = await prisma.user.findFirst({
    where: {
      email: payload.email,
    },
  });

  if (user.status === 'PENDING') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You need to approve by admin');
  }

  if (user) {
    return user;
  }

  throw new ApiError(httpStatus.NOT_FOUND, 'user not found');
};

exports.loginByEmailAndPassword = async ({ email, password }) => {
  const user = await getUserDetail({ email });

  const isPasswordMatched = bcrypt.compareSync(password, user.password);

  if (!isPasswordMatched)
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      'invalid username/email or password',
      [{ context: { key: 'password' }, message: 'Invalid email or password' }],
    );

  delete user.password;
  return user;
};

exports.refreshAuth = async refreshToken => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(
      refreshToken,
      auth.tokenTypes.REFRESH,
    );

    const user = await userService.findUserById(refreshTokenDoc.sub);

    if (!user) {
      throw new Error(httpStatus.UNAUTHORIZED, 'Please Authenticate');
    }

    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};
