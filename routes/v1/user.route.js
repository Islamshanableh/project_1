const express = require('express');

const validate = require('../../middlewares/validate');
const { auth } = require('../../middlewares/auth');

const { userController } = require('../../controllers');

const { userValidation } = require('../../validations');

const { routePermissions } = require('../../constants');

const router = express.Router();

router
  .route('/')
  .get(auth(), validate(userValidation.getById), userController.getUserById)
  .put(auth(), validate(userValidation.update), userController.updateUser)
  .delete(auth(), validate(userValidation.getById), userController.deleteUser);

router
  .route('/list')
  .get(
    auth(routePermissions.ADMIN.read),
    validate(userValidation.userList),
    userController.userList,
  );

router
  .route('/approve')
  .put(
    auth(routePermissions.ADMIN.update),
    validate(userValidation.getById),
    userController.approveUser,
  );

module.exports = router;
