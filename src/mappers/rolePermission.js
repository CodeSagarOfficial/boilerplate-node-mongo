'use strict';
const _ = require('underscore');
const roleMapper = require("./role");
const permissionMapper = require("./permission");

exports.toModel = (entity) => {
    const model = {
        id: entity._id,
        roleId: entity.roleId,
        permissionId: entity.permissionId
    };
    if (entity.permission) {
        model.permission = permissionMapper.toModel(entity.permission);
    }
    if (entity.role) {
        model.role = roleMapper.toModel(entity.role);
    }
    return model;
};

exports.toSearchModel = (entities) => {
    return _.map(entities, exports.toModel);
};

exports.newEntity = (entity) => {
    const model = {
        role: entity.roleId,
        permission: entity.permissionId
    };
    return model;
};