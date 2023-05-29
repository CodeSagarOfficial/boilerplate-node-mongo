"use strict";
const number = require('../../helpers/number');
const userMapper = require('../mappers/user');
const moment = require("moment");
const sessionS = require("./sessions");
const userS = require("./users");
const jwt = require("../helpers/jwt")
const utils = require('../../helpers/utils')

exports.checkIfExist = async (model) => {
  let where = model;
  let populate = [
    { path: 'role' },
    { path: "currentProfile" },
    { path: "profiles" }
  ]
  return await db.user.findOne(where).populate(populate);
};

exports.register = async (body) => {
  try {
    let model = await userMapper.newEntity(body, false);
    model.email = model.email.toLowerCase();
    let entity = new db.user(model);
    entity.activationCode = number.randomPin();
    let userUniqueId = await utils.createUniqueCode('user')
    entity.UniqueId = userUniqueId
    return await entity.save();
  }
  catch (error) {
    throw error
  }
};

exports.createSession = async (user, model) => {
  try {
    if (model.deviceId || model.deviceType) {
      user.deviceId = model.deviceId;
      user.deviceType = model.deviceType;
    }
    let session = await sessionS.create(user);
    user = await userS.update(user.id, {
      lastLogin: moment.utc(),
      refreshToken: jwt.getRefreshToken(user),
    });
    return session

  }
  catch (error) {
    throw error
  }
}
