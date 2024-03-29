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

exports.uploadFilesTicket = catchAsync(async (req, res) => {
  const result = await ticketService.uploadFiles(req.files);
  res.status(httpStatus.OK).send({ result });
});

exports.createComment = catchAsync(async (req, res) => {
  const userId = req?.user?.sub?.id;
  const result = await ticketService.createComment({ ...req.body, userId });
  res.status(httpStatus.OK).send({ result });
});

exports.updateComment = catchAsync(async (req, res) => {
  const userId = req?.user?.sub?.id;
  const result = await ticketService.updateComment({ ...req.body, userId });
  res.status(httpStatus.OK).send({ result });
});

exports.deleteComment = catchAsync(async (req, res) => {
  const userId = req?.user?.sub?.id;
  const result = await ticketService.deleteComment({
    commentId: req?.query?.id,
    userId,
  });
  res.status(httpStatus.OK).send({ result });
});

exports.deleteFile = catchAsync(async (req, res) => {
  const result = await ticketService.deleteFile(req?.query?.id);
  res.status(httpStatus.OK).send({ result });
});
