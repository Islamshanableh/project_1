/* eslint-disable no-restricted-syntax */
const httpStatus = require('http-status');
const { Prisma } = require('@prisma/client');
const { prisma } = require('./prisma.service');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');

exports.createSection = async payload => {
  let order = 0;
  if (!payload.order) {
    const findOrder = await prisma.section.findMany({
      where: {
        order: {
          gte: payload.order,
        },
      },
      orderBy: {
        order: 'desc',
      },
      take: 1,
    });
    order = findOrder[0]?.order + 1;
  }

  const result = await prisma.section
    .create({
      data: {
        ...payload,
        order,
      },
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

  return result;
};

exports.createCheckList = async payload => {
  let order = 0;
  if (!payload.order) {
    const findOrder = await prisma.checkList.findMany({
      where: {
        order: {
          gte: payload.order,
        },
      },
      orderBy: {
        order: 'desc',
      },
      take: 1,
    });
    order = findOrder[0]?.order + 1;
  }
  const result = await prisma.checkList
    .create({
      data: { ...payload, order },
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

  return result;
};

exports.createMaterial = async payload => {
  let order = 0;
  if (!payload.order) {
    const findOrder = await prisma.checkList.findMany({
      where: {
        order: {
          gte: payload.order,
        },
      },
      orderBy: {
        order: 'desc',
      },
      take: 1,
    });
    order = findOrder[0]?.order + 1;
  }
  const result = await prisma.material
    .create({
      data: { ...payload, order },
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

  return result;
};

exports.getSectionList = async search => {
  const result = await prisma.section.findMany({
    where: {
      isActive: true,
      OR: [
        {
          ticket: {
            some: {
              title: {
                contains: search,
              },
            },
          },
        },
        {
          ticket: {
            every: {},
          },
        },
      ],
    },
    include: {
      ticket: {
        where: {
          title: {
            contains: search,
          },
        },
        include: {
          comment: {
            where: {
              isActive: true,
              isDeleted: false,
            },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          media: {
            where: {
              isActive: true,
              isDeleted: false,
            },
          },
          historyLog: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      order: 'asc',
    },
  });

  result?.map(async item => {
    const newItem = item;
    newItem?.ticket?.map(async itemTicket => {
      if (itemTicket?.media?.length) {
        itemTicket?.media?.map(async itemMedia => {
          if (itemMedia?.link) {
            itemMedia.link = `${config.aws.prefix}${itemMedia.link}`;
          }
          return itemMedia;
        });
      }
      return itemTicket;
    });

    return item;
  });

  return result;
};

exports.getCheckList = async () => {
  const result = await prisma.checkList.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      order: 'asc',
    },
  });

  return result;
};

exports.getMaterialList = async () => {
  const result = await prisma.material.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      order: 'asc',
    },
  });

  return result;
};

exports.getSectionById = async id => {
  const result = await prisma.section.findFirst({
    where: {
      id,
    },
  });

  return result;
};

exports.getCheckListById = async id => {
  const result = await prisma.checkList.findFirst({
    where: {
      id,
    },
  });

  return result;
};

exports.getMaterialById = async id => {
  const result = await prisma.material.findFirst({
    where: {
      id,
    },
  });

  return result;
};

exports.deleteSection = async id => {
  const result = await prisma.section.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  });

  return result;
};

exports.deleteCheckList = async id => {
  const result = await prisma.checkList.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  });

  return result;
};

exports.deleteMaterial = async id => {
  const result = await prisma.material.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  });

  return result;
};

exports.updateSection = async payload => {
  if (payload.order) {
    await prisma.section.updateMany({
      where: {
        order: {
          gte: payload.order,
        },
      },
      data: {
        order: {
          increment: 1,
        },
      },
    });
  }

  const result = await prisma.section
    .update({
      where: {
        id: payload.id,
      },
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

  return result;
};

exports.updateCheckList = async payload => {
  if (payload.order) {
    await prisma.checkList.updateMany({
      where: {
        order: {
          gte: payload.order,
        },
      },
      data: {
        order: {
          increment: 1,
        },
      },
    });
  }
  const result = await prisma.checkList
    .update({
      where: {
        id: payload.id,
      },
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

  return result;
};

exports.updateMaterial = async payload => {
  if (payload.order) {
    await prisma.material.updateMany({
      where: {
        order: {
          gte: payload.order,
        },
      },
      data: {
        order: {
          increment: 1,
        },
      },
    });
  }
  const result = await prisma.material
    .update({
      where: {
        id: payload.id,
      },
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

  return result;
};
