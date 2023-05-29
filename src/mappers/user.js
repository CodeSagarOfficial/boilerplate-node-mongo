'use strict';
const crypto = require('../helpers/crypto');
const roleMapper = require('../mappers/role');
const _ = require('underscore');

exports.toModel = (entity) => {
     const model = {
          id: entity._id,
          firstName: entity.firstName,
          lastName: entity.lastName,
          email: entity.email,
          countryCode: entity.countryCode,
          phone: entity.phone,
          isEmailVerified: entity.isEmailVerified,
          isPhoneVerified: entity.isEmailVerified,
          imgUrl: entity.imgUrl,
          status: entity.status,
          loginType: entity.loginType,
          imgUrl: entity.imgUrl
     };
     if (entity.role) {
          model.role = roleMapper.toModel(entity.role);
     }
     return model;
};

exports.toSearchModel = (entities) => {
     return _.map(entities, exports.toModel);
};

exports.toAuthModel = (entity) => {
     let model = exports.toModel(entity);
     if (entity.session) {
          model.accessToken = entity.session.accessToken;
     }
     return model;
};

exports.newEntity = async (body, createdByAdmin = true) => {
     const model = {
          uniqueCode: body.uniqueCode,
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          countryCode: body.countryCode,
          phone: body.phone,
          imgUrl: body.imgUrl,
          loginType: body.loginType,
          imgUrl: body.imgUrl,
          role: body.roleId
     };
     if (body.password) {
          model.password = await crypto.setPassword(body.password);
     }

     if (createdByAdmin) {
          if (body.loginType == 'email') {
               model.isEmailVerified = true;
          } else if(body.loginType == 'phone'){
               model.isPhoneVerified = true;
          }
          model.status = 'active';
     }
     return model;
};
