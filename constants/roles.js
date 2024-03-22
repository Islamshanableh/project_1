const permissions = require("./route.permissions");

const common = [];

module.exports = {
  types: ["ADMIN", "USER", "WORKER", "GUEST"],
  ADMIN: {},
  USER: {},
  GUEST: {},
};
