"use strict";
const jwt = require("../../helpers/jwt");
const moment = require("moment");

// const include = [
//   {
//     model: db.user,
//     include: [
//       {
//         model: db.role,
//       },
//     ],
//   },
// ];

// const populate = [
//     {path:"user"},
// ]


exports.create = async (user) => {
  try {
    let entity = new db.session({
      user: user.id, fcmToken: user.deviceId, deviceType: user.deviceType
    });
    entity = await entity.save();
    entity.accessToken = jwt.getAccessToken(user, entity);
    return entity.save();
  } catch (error) {
    console.log(error);
    return error;
  }
};

exports.update = async (user, value) => {
  try {
    let entity = await db.session.findOne({ user: user.id });
    entity.updatedAt = moment().utc().format();
    entity.status = value.status;
    return entity.save();
  } catch (error) {
    console.log(error);
    return error;
  }
};

exports.get = async (id) => {
  return await db.session.findById(id)
};
