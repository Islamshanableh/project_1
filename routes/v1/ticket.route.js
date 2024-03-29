const express = require('express');

const validate = require('../../middlewares/validate');
const { auth } = require('../../middlewares/auth');

const { ticketController } = require('../../controllers');

const { ticketValidation } = require('../../validations');

const { routePermissions } = require('../../constants');

const router = express.Router();

router
  .route('/')
  .get(
    auth(),
    validate(ticketValidation.getById),
    ticketController.getTicketById,
  )
  .post(
    auth(),
    validate(ticketValidation.createTicket),
    ticketController.createTicket,
  )
  .put(
    auth(),
    validate(ticketValidation.update),
    ticketController.updateTicket,
  );

router.route('/upload').post(auth(), ticketController.uploadFilesTicket);

router
  .route('/comment')
  .delete(
    auth(),
    validate(ticketValidation.getById),
    ticketController.deleteComment,
  )
  .post(
    auth(),
    validate(ticketValidation.createComment),
    ticketController.createComment,
  )
  .put(
    auth(),
    validate(ticketValidation.updateComment),
    ticketController.updateComment,
  );

module.exports = router;
