const mongoose = require("mongoose");

module.exports = {

  role: { type: mongoose.Types.ObjectId, ref: "role" },
  roleId: String,
  permissionId: String,
  permission: { type: mongoose.Types.ObjectId, ref: "permission" }
};
