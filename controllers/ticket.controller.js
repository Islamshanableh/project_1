const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { ticketService } = require('../services');

// const ApiError = require('../utils/ApiError');
// const { errorMessage } = require('../utils/helpers');

exports.createTicket = catchAsync(async (req, res) => {
  const result = await ticketService.createTicket(req.body);
  res.status(httpStatus.OK).send({ result });
});

exports.updateTicket = catchAsync(async (req, res) => {
  const payload = req?.body;

  const result = await ticketService.updateTicket(payload);
  res.status(httpStatus.OK).send({ result });
});

exports.getTicketById = catchAsync(async (req, res) => {
  const result = await ticketService.getTicketById(req?.query?.id);
  res.status(httpStatus.OK).send({ result });
});
