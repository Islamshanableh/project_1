/* eslint-disable no-param-reassign */

const bcrypt = require("bcryptjs");
const httpStatus = require("http-status");

const { Prisma } = require("@prisma/client");

const { prisma } = require("./prisma.service");
const { hash } = require("../config/config");

const ApiError = require("../utils/ApiError");

exports.register = async (payload) => {
  payload.password = bcrypt.hashSync(payload.password, hash.secret);
  payload.status = 'PENDING'
  payload.role = 'USER'
  const user = await prisma.user
    .create({
      data: payload,
    })
    .catch((e) => {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (typeof e === "string") e = JSON.parse(e);
        const errMeta = e?.meta;
        if (e.code === "P2002") {
          if (
            errMeta &&
            errMeta?.target &&
            typeof errMeta.target === "string"
          ) {
            const arr = errMeta.target
              .replaceAll("_", " ")
              .replace("key", "")
              .concat("allready exists")
              .split(" ");

            arr.shift();
            const msg = arr.join(" ");

            throw new ApiError(httpStatus.BAD_REQUEST, msg);
          }
        } else if (e?.meta?.target && typeof e.meta.target === "string") {
          const msg = e?.meta?.target
            .replaceAll("_", " ")
            .replace("key", "")
            .concat("allready exists");
          throw new ApiError(httpStatus.BAD_REQUEST, msg);
        }
      }
    });

  delete user.password;
  return user;
};
