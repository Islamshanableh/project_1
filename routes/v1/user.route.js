const express = require("express");

const validate = require("../../middlewares/validate");
const { auth } = require("../../middlewares/auth");

const { userController, wishlistController } = require("../../controllers");

const { userValidation } = require("../../validations");

const { routePermissions } = require("../../constants");

const router = express.Router();

router
  .route("/list")
  .post(auth(), validate(userValidation.userList), userController.userList);

module.exports = router;
