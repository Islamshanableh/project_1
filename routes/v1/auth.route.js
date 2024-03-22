const express = require('express');

const validate = require('../../middlewares/validate');

const router = express.Router();
const { authController } = require('../../controllers');
const { authValidation } = require('../../validations');

router
  .route('/register')
  .post(validate(authValidation.register), authController.register);

router
  .route('/login')
  .post(
    validate(authValidation.loginByEmailAndPassword),
    authController.loginByEmailAndPassword,
  );

module.exports = router;
