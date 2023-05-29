'use strict';
var jwt = require('jsonwebtoken');
var authConfig = require('config').get('authConfig');

exports.getAccessToken = (user, session) => {
     var claims = {
          session: session.id,
          user: user.id,
     };
     return jwt.sign(claims, authConfig.secret, {
          expiresIn: authConfig.tokenPeriod,
     });
};

exports.getRefreshToken = (user) => {
     var claims = {
          user: user.id,
     };
     return jwt.sign(claims, authConfig.refreshSecret, {
          expiresIn: authConfig.refreshPeriod,
     });
};

exports.verifyToken = () => {
     return jwt.verify(token, authConfig.secret);
};
