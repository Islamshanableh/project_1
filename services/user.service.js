/* eslint-disable no-param-reassign */

const bcrypt = require('bcryptjs');
const httpStatus = require('http-status');

const { Prisma } = require('@prisma/client');

const { prisma } = require('./prisma.service');
const { hash } = require('../config/config');

const ApiError = require('../utils/ApiError');

exports.register = async payload => {
  payload.password = bcrypt.hashSync(payload.password, hash.secret);
  payload.status = 'PENDING';
  payload.role = 'USER';
  const user = await prisma.user
    .create({
      data: payload,
    })
    .catch(e => {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (typeof e === 'string') e = JSON.parse(e);
        const errMeta = e?.meta;
        if (e.code === 'P2002') {
          if (
            errMeta &&
            errMeta?.target &&
            typeof errMeta.target === 'string'
          ) {
            const arr = errMeta.target
              .replaceAll('_', ' ')
              .replace('key', '')
              .concat('allready exists')
              .split(' ');

            arr.shift();
            const msg = arr.join(' ');

            throw new ApiError(httpStatus.BAD_REQUEST, msg);
          }
        } else if (e?.meta?.target && typeof e.meta.target === 'string') {
          const msg = e?.meta?.target
            .replaceAll('_', ' ')
            .replace('key', '')
            .concat('allready exists');
          throw new ApiError(httpStatus.BAD_REQUEST, msg);
        }
      }
    });

  delete user.password;
  return user;
};

exports.getUserById = async id => {
  const result = await prisma.user.findFirst({
    where: {
      id,
    },
    include: {
      sections: {
        include: {
          ticket: {
            where: {
              userId: id,
            },
          },
        },
      },
    },
  });

  return result;
};

exports.approveUserById = async payload => {
  await prisma.user.update({
    where: {
      id: payload?.id,
    },
    data: {
      sections: {
        set: [],
      },
    },
  });
  const result = await prisma.user.update({
    where: {
      id: payload?.id,
    },
    data: {
      status: 'APPROVED',
      role: payload?.role,
      sections: {
        connect: payload.sectionsIds.map(sectionId => ({ id: sectionId })),
      },
    },
  });

  return result;
};

exports.updateUserById = async payload => {
  const result = await prisma.user.update({
    where: {
      id: payload.id,
    },
    data: payload,
  });

  return result;
};

exports.deleteUserById = async id => {
  await prisma.user.update({
    where: {
      id,
    },
    data: { isActive: false },
  });
};

exports.getUserList = async status => {
  const result = await prisma.user.findMany({
    where: {
      status,
    },
    include: {
      sections: true,
    },
  });

  return result;
};
