const mongoose = require("mongoose");

module.exports = {
  
  accessToken: String,
  refreshToken: String,
  fcmToken: String,

  deviceType: {
    type: String,
    enum: ['web', 'ios', 'android'],
    default: "web"
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },

  status: {
    type: String,
    enum: ["active", "expired"],
    default: "active"
  }
};
