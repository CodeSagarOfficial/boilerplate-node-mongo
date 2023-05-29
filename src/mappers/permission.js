'use strict';
const _ = require('underscore');

exports.toModel = (entity) => {
    const model = {
        id: entity._id,
        name:entity.name,
        route:entity.route
    }
    return model;
};

exports.toSearchModel = (entities) => {
    return _.map(entities, exports.toModel);
};

exports.newEntity = (entity) => {
    const model = {
        name:entity.name,
        route:entity.route
    };
    return model;
};