/* eslint-disable no-param-reassign */

const { prisma } = require('./prisma.service');

exports.createTicket = async payload => {
  const result = await prisma.ticket.create({
    data: {
      title: payload.title,
      fields: payload.fields,
      sectionId: payload.sectionId,
      userId: payload.userId,
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
    },
  });

  return result;
};

exports.getTicketById = async id => {
  const result = await prisma.ticket.findUnique({
    where: {
      id,
    },
  });

  return result;
};
