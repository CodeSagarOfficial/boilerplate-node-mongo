'use strict';
const _ = require('underscore');

exports.toModel = (entity) => {
     const model = {
          id: entity._id,
          name: entity.name,
          code: entity.code,
          description: entity.description
     };
     return model;
};

exports.newEntity = async (body) => {
     const model = {
          name: body.name,
          code: body.code,
          weight: body.weight,
          description: body.description,
     };
     return model;
};

exports.toSearchModel = (entities) => {
     return _.map(entities, exports.toModel);
};
