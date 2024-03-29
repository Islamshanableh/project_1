/* eslint-disable no-param-reassign */
const cuid = require('cuid');
const httpStatus = require('http-status');
const { prisma } = require('./prisma.service');
const ApiError = require('../utils/ApiError');
const { uploadFile } = require('./common/aws.service');

exports.createTicket = async payload => {
  const result = await prisma.ticket.create({
    data: {
      title: payload.title,
      fields: payload.fields,
      sectionId: payload.sectionId,
      userId: payload.userId,
      media: {
        create: payload?.files?.map(file => ({ link: file })),
      },
    },
  });

  return result;
};

exports.updateTicket = async payload => {
  const result = await prisma.ticket.update({
    where: {
      id: payload.id,
    },
    data: {
      title: payload.title,
      fields: payload.fields,
      sectionId: payload.sectionId,
      userId: payload.userId,
      media: {
        create: payload?.files?.map(file => ({ link: file })),
      },
    },
  });

  return result;
};

exports.getTicketById = async id => {
  const result = await prisma.ticket.findUnique({
    where: {
      id,
    },
    include: {
      comment: {
        where: {
          isActive: true,
          isDeleted: false,
        },
      },
      media: {
        where: {
          isActive: true,
          isDeleted: false,
        },
      },
    },
  });

  return result;
};

exports.uploadFiles = async files => {
  const ticketFiles = [];
  if (typeof files === 'object') {
    if (files?.files?.length) {
      await Promise.all(
        files?.files?.map(async file => {
          const fileName = `${cuid()}-${file.name}`;
          const upload = await uploadFile(file.data, `tickets/${fileName}`);
          ticketFiles.push(upload?.Key);
        }),
      );
    } else {
      const fileName = `${cuid()}-${files.name}`;
      const upload = await uploadFile(files.data, `tickets/${fileName}`);
      ticketFiles.push(upload?.Key);
    }
  }

  return ticketFiles;
};

exports.deleteFile = async id => {
  const result = await prisma.media.update({
    where: {
      id,
    },
    data: {
      isActive: false,
      isDeleted: true,
    },
  });

  return result;
};

exports.createComment = async payload => {
  const result = await prisma.comment.create({
    data: {
      ...payload,
      ticketId: payload.ticketId,
      content: payload.content,
      userId: payload.userId,
    },
  });

  return result;
};

exports.canEditComment = async (userId, commentId) => {
  const commentDetails = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
  });

  return commentDetails?.userId === userId;
};

exports.updateComment = async payload => {
  const canUpdate = await this.canEditComment(
    payload.userId,
    payload.commentId,
  );

  if (canUpdate) {
    const comment = await prisma.comment.update({
      where: {
        id: payload.commentId,
      },
      data: {
        content: payload.content,
      },
    });

    return comment;
  }
  throw new ApiError(httpStatus.FORBIDDEN, "you can't update this comment");
};

exports.deleteComment = async payload => {
  const canUpdate = await this.canEditComment(
    payload.userId,
    payload.commentId,
  );

  if (canUpdate) {
    const comment = await prisma.comment.update({
      where: {
        id: payload.commentId,
      },
      data: {
        isActive: false,
        isDeleted: true,
      },
    });

    return comment;
  }
  throw new ApiError(httpStatus.FORBIDDEN, "you can't delete this comment");
};
