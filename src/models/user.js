const mongoose = require('mongoose');

module.exports = {
     firstName: String,
     lastName: String,
     authType: {
          type: String,
          enum: ['email', 'google', 'facebook', 'apple', 'github', 'phone'],
          default: null,
     },
     email: String,
     googleId: String,
     facebookId: String,
     appleId: String,
     githubId: String,
     imgUrl: String,
     countryCode: String,
     phone: String,
     verificationCode: String,
     password: String,
     salt: String,
     status: {
          type: String,
          enum: ['pending', 'active', 'inactive', 'deleted', 'blocked'],
          default: 'pending',
     },
     isEmailVerified: { type: Boolean, default: false },
     isPhoneVerified: { type: Boolean, default: false },
     lastLogin: Date,
     role: { type: mongoose.Types.ObjectId, ref: 'role' }
};
