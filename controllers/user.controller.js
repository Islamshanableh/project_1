const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { userService, tokenService } = require("../services");
const pick = require("../utils/pick");

// const ApiError = require('../utils/ApiError');
// const { errorMessage } = require('../utils/helpers');

exports.userList = catchAsync(async (req, res) => {
  const options = pick(req.query, ["skip", "take", "draw"]);
  const searchField = req?.body?.searchField;
  const { filter, search, sort } = pick(req.body, ["filter", "search", "sort"]);
  const { users, recordsFiltered, recordsTotal } = await userService.userList(
    options,
    filter,
    search,
    sort,
    searchField
  );
  res
    .status(httpStatus.OK)
    .send({ recordsTotal, recordsFiltered, draw: options.draw, data: users });
});

exports.findUserIdentifications = catchAsync(async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const options = pick(req.query, ["skip", "take", "draw", "search"]);

  const { identifications, recordsTotal, recordsFiltered } =
    await userService.findUserIdentifications(userId, options);

  res.status(httpStatus.OK).send({
    recordsTotal,
    recordsFiltered,
    draw: options.draw,
    user: identifications?.user,
    data: identifications,
  });
});

exports.update = catchAsync(async (req, res) => {
  const userId = req.user.sub.id;
  const userBody = pick(req.body, [
    "firstName",
    "lastName",
    "countryId",
    "address",
  ]);
  const userImageFile = req.files.userImage;
  if (!userImageFile) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ error: "User image file is required" });
  }
  try {
    const uploadPathStr = userImageFile[0].path.slice(1).split("/")[2];
    const uploadedFile1 = await uploadFile(
      {
        path: userImageFile[0].path,
        id: `${userId}.jpg`,
      },
      uploadPathStr
    );

    const user = await userService.updateByUserId(
      userId,
      userBody,
      uploadedFile1.Key
    );

    res.status(httpStatus.ACCEPTED).send({ user });
  } catch (error) {
    console.log(error);
    // Handle error during file upload
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to upload user image" });
  }
});

exports.getUserCurrentPlan = catchAsync(async (req, res) => {
  const userId = req.user.sub.id;
  const plan = await userService.getUserCurrentPlan(userId);
  res.status(httpStatus.ACCEPTED).send({ plan });
});

exports.blockUser = catchAsync(async (req, res) => {
  const options = pick(req.body, ["userId", "isBlocked"]);
  const user = await userService.blockByUserId(options);
  res.status(httpStatus.ACCEPTED).send({ user });
});

exports.sendMessage = catchAsync(async (req, res) => {
  const options = pick(req.body, ["subject", "message"]);
  const { id } = req.user.sub;

  await userService.contact(id, options);

  res.status(httpStatus.OK).send("Sent");
});

exports.reportUser = catchAsync(async (req, res) => {
  const reporterId = req.user.sub.id;
  const report = req.body;

  const result = await userService
    .reportUser(reporterId, report)
    .catch((error) => {
      return res.status(httpStatus.SERVICE_UNAVAILABLE).send({
        error: "something went wrong .. !",
        errorMessage: error?.message,
      });
    });

  res.status(httpStatus.CREATED).send(result);
});

exports.listUserPublishedItems = catchAsync(async (req, res) => {
  const options = pick(req.query, ["skip", "take", "draw"]);
  const { filter, search } = pick(req.body, ["filter", "search"]);

  const sellerId = req.user.sub.id;
  const { storeItems, recordsFiltered, recordsTotal } =
    await storeService.userPublishedItems(sellerId, options, filter, search);

  res
    .status(httpStatus.OK)
    .send({ recordsTotal, recordsFiltered, data: storeItems });
});

exports.listUserPurchasedOrders = catchAsync(async (req, res) => {
  const options = pick(req.query, ["skip", "take", "search"]);
  const userId = req.user.sub.id;

  const { orders, recordsFiltered, recordsTotal } =
    await storeService.listPurchasedOrders(userId, options);

  res
    .status(httpStatus.OK)
    .send({ recordsTotal, recordsFiltered, purchaseOrders: orders });
});

exports.orders = catchAsync(async (req, res) => {
  const userId = req.user.sub.id;
  const orders = await storeService.listUserOrders(userId);

  res.status(httpStatus.OK).send(orders);
});

exports.itemShipped = catchAsync(async (req, res) => {
  const { orderId, trackingId } = pick(req.query, ["orderId", "trackingId"]);
  const orderDetails = await storeService.itemShiped(orderId, trackingId);

  res.status(httpStatus.OK).send(orderDetails);
});

exports.itemDelivered = catchAsync(async (req, res) => {
  const { orderId } = req.query;
  const orderDetails = await storeService.itemDelivered(orderId);

  res.status(httpStatus.OK).send(orderDetails);
});

exports.addNewDevice = catchAsync(async (req, res) => {
  const userId = req.user.sub.id;
  const device = pick(req.body, ["deviceId", "deviceType"]);

  const result = await userService.addUserDeviceToken(userId, device);

  res.status(httpStatus.CREATED).send(result);
});

exports.removeDevice = catchAsync(async (req, res) => {
  const id = pick(req.query, ["id"]);
  const result = await userService.removeUserDeviceToken(id);

  res.status(httpStatus.OK).send(result);
});

exports.updateShippingSettings = catchAsync(async (req, res) => {
  const userId = req.user.sub.id;
  const payload = pick(req.body, ["excludeCountries", "defaultOptions"]);

  const result = await userService.updateShippingSettings(userId, payload);

  res.status(httpStatus.CREATED).send(result);
});

exports.getShippingSettings = catchAsync(async (req, res) => {
  const userId = req.user.sub.id;
  const result = await userService.getShippingSettings(userId);
  res.status(httpStatus.OK).send(result);
});

exports.updatePaypalAccountDetails = catchAsync(async (req, res) => {
  const { code } = req.body;
  const { id } = req?.user?.sub;

  const update = await userService.updatePaypalAccountDetails({ code, id });
  res.status(httpStatus.CREATED).send(update);
});

exports.getPaypalAccountDetails = catchAsync(async (req, res) => {
  const user = pick(req?.user?.sub, ["id"]);

  const accountDetails = await userService.getPaypalAccountDetails(user);

  if (accountDetails?.paypalInfo?.paypalTokens)
    delete accountDetails?.paypalInfo?.paypalTokens;

  res.status(httpStatus.OK).send({ accountDetails });
});

exports.resetPassword = catchAsync(async (req, res) => {
  const { id } = req?.body;

  const result = await userService.resetPassword(id, tokenService);

  res.status(httpStatus.OK).send({ result });
});

exports.sellingLimit = catchAsync(async (req, res) => {
  const { id } = req?.user?.sub;
  const userId = req?.query?.userId || id;
  const result = await userService.sellingLimit(userId);

  res.status(httpStatus.OK).send({ result });
});

exports.sellingLimitUpdate = catchAsync(async (req, res) => {
  const { id } = req?.user?.sub;
  const limit = req?.query?.limit;
  const userId = req?.query?.userId || id;
  const result = await userService.sellingLimitUpdate(userId, limit);

  res.status(httpStatus.OK).send({ result });
});

// ADMIN ***************************
exports.AdminLoginByEmailAndPassword = catchAsync(async (req, res) => {
  const payload = pick(req.body, ["email", "password"]);
  const admin = await userService.AdminLoginByEmailAndPassword(payload);
  const tokens = await tokenService.generateAuthTokens(admin);

  res.status(httpStatus.ACCEPTED).send({ admin, tokens });
});
exports.getWorkersList = catchAsync(async (req, res) => {
  const options = pick(req.query, ["skip", "take", "draw"]);
  const { filter, search, sort } = pick(req.body, ["filter", "search", "sort"]);
  const searchField = req?.body?.searchField;
  const { users, recordsFiltered, recordsTotal } =
    await userService.getWorkersList(
      options,
      filter,
      search,
      sort,
      searchField
    );
  res
    .status(httpStatus.OK)
    .send({ recordsTotal, recordsFiltered, draw: options.draw, data: users });
});
exports.FindWorkerById = catchAsync(async (req, res) => {
  const workerId = req?.managementUser?.sub?.id;

  const worker = await userService.FindWorkerById(workerId);

  return res.status(httpStatus.OK).send(worker);
});

exports.blockWorker = catchAsync(async (req, res) => {
  const { id, isBlocked } = req.body;
  const worker = await userService.blockWorker(id, isBlocked);
  res.status(httpStatus.ACCEPTED).send({ result: worker });
});

exports.deactivateWorker = catchAsync(async (req, res) => {
  const { id, isActive } = req.body;
  const worker = await userService.deactivateWorker(id, isActive);
  res.status(httpStatus.OK).send({
    result: worker,
  });
});

exports.updateWorker = catchAsync(async (req, res) => {
  const workerBody = pick(req.body, [
    "id",
    "firstName",
    "lastName",
    "role",
    "email",
  ]);

  const worker = await userService.updateWorker(workerBody);
  res.status(httpStatus.ACCEPTED).send({ worker });
});

exports.completeUserDetails = catchAsync(async (req, res) => {
  const user = req?.user?.sub;

  const payload = req?.body;
  const password = payload?.password;

  const result = await userService.completeUserDetails(payload, user, password);

  res.status(httpStatus.ACCEPTED).send({ data: result });
});

exports.changePassword = catchAsync(async (req, res) => {
  const userId = req?.user?.sub?.id;

  const payload = req?.body;

  const result = await userService.changePassword(payload, userId);

  res.status(httpStatus.ACCEPTED).send({ data: result });
});

exports.profileInformation = catchAsync(async (req, res) => {
  const userId = req?.user?.sub?.id;
  const result = await userService.profileInformation(userId);
  res.status(httpStatus.ACCEPTED).send({ data: result });
});

exports.FindUserById = catchAsync(async (req, res) => {
  const userId = req?.user?.sub?.id;
  const userIdFromAdmin = parseInt(req?.query?.id, 10);

  const userById = await userService.findUserById(userIdFromAdmin || userId);

  return res.status(httpStatus.OK).send(userById);
});

exports.likeItem = catchAsync(async (req, res) => {
  const payload = req.body;
  const userId = req?.user?.sub?.id;
  const result = await userService.likeItem(userId, payload);
  res.status(httpStatus.CREATED).send(result);
});

exports.listOfLikes = catchAsync(async (req, res) => {
  const userId = req?.user?.sub?.id;
  const options = req.query;
  const result = await userService.listOfLikes(userId, options);
  res.status(httpStatus.CREATED).send(result);
});

exports.deleteUserProfile = catchAsync(async (req, res) => {
  const userInfo = req?.user?.sub;
  await userService.deleteUserProfile(userInfo);

  res
    .status(httpStatus.ACCEPTED)
    .send({ message: "Your account has been deleted successfully " });
});

exports.suspendUserProfile = catchAsync(async (req, res) => {
  const userId = req?.user?.sub?.id;
  const result = await userService.suspendUserProfile(userId);

  res.status(httpStatus.ACCEPTED).send({
    result,
    message: "Your account has been deactivated successfully ",
  });
});

exports.sendHelpEmail = catchAsync(async (req, res) => {
  const payload = pick(req.body, ["subject", "message"]);
  const userData = req?.user?.sub;
  userData.name = `${userData?.firstName || ""} ${userData?.lastName || ""}`;
  userData.phone = userData?.mobile || "";
  let imagePath;
  if (req?.files?.length) {
    imagePath = req?.files[0];
  }
  // if (!req?.files?.length)
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'please upload the image');
  await userService.sendHelpEmail(userData, payload, imagePath);

  res.status(httpStatus.OK).send({ message: "Message sent successfully" });
});

exports.sendHelpEmailWithoutToken = catchAsync(async (req, res) => {
  const payload = pick(req.body, [
    "name",
    "phone",
    "email",
    "subject",
    "message",
  ]);
  const { subject, message } = payload;

  let imagePath;
  if (req?.files?.length) {
    imagePath = req?.files[0];
  }
  // if (!req?.files?.length)
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'please upload the image');
  await userService.sendHelpEmail(payload, { subject, message }, imagePath);

  res.status(httpStatus.OK).send({ message: "Message sent successfully" });
});

exports.selectLanguage = catchAsync(async (req, res) => {
  const user = req?.user?.sub;
  const languageId = req?.query?.lang;
  const deviceId = req?.query?.deviceId;

  await userService.selectLanguage(user, languageId, deviceId);
  res.status(httpStatus.ACCEPTED).send({
    result: "done",
  });
});

exports.onOffNotificationUser = catchAsync(async (req, res) => {
  const userId = req?.user?.sub?.id;

  const updateUser = await userService.onOffNotificationUser(userId, req.body);
  res.status(httpStatus.OK).send({ result: updateUser });
});
