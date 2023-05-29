const mapper = require('../mappers/rolePermission');
const _ = require('underscore');
const updateEntities = require('../../helpers/updateEntities');
const mongoose = require('mongoose');

const set = (model, entity) => {
     return updateEntities.update(model, entity);
};

const getById = async (id) => {
     return await db.rolePermission.findById(id);
};
const getByCondition = async (condition) => await db.rolePermission.findOne(condition);


exports.create = async (model) => {
     try {
          let entity = new db.rolePermission(mapper.newEntity(model));
          return await entity.save();
     } catch (error) {
          throw error;
     }
};

exports.update = async (id, model) => {
     try {
          let entity = await db.rolePermission.findById(id);
          set(model, entity);
          return entity.save();
     } catch (err) {
          throw err;
     }
};

exports.search = async (query, page) => {
     let where = {};
     if (query.roleId) {
          where['role'] = query.roleId;

     }
     if (query.permissionId) {
          where['permission'] = query.permissionId;

     }
     // let model = [
     //      { 
     //           $lookup: {
     //                from: 'roles',
     //                localField: 'roleId',
     //                foreignField: '_id',
     //                as: 'role',
     //           },
     //      },
     //      {
     //           $unwind: {
     //                path: '$role',
     //                preserveNullAndEmptyArrays: true,
     //           },
     //      },
     //      {
     //           $lookup: {
     //                from: 'permissions',
     //                localField: 'permissionId',
     //                foreignField: '_id',
     //                as: 'permission',
     //           },
     //      },
     //      {
     //           $unwind: {
     //                path: '$permission',
     //                preserveNullAndEmptyArrays: true,
     //           },
     //      },
     // ];
     const count = await db.rolePermission.countDocuments(where);
     let items;
     if (page) {

          items = await db.rolePermission.find(where).skip(page.skip).limit(page.limit).sort({ "timeStamp": -1 });
     } else {
          items = db.rolePermission.find(where).sort({ "timeStamp": -1 });
     }
     return {
          count,
          items,
     };
};
exports.get = async (query) => {
     if (typeof query === 'string') {
          if (query.isObjectId()) {
               return getById(query);
          }
     }
     if (query.id) {
          return getById(query.id);
     }
     if (query.name) {
          return getByCondition({
               name: query.name,
          });
     }
     return null;
};

exports.remove = async (id) => {
     let entity = await this.get(id);
     if (entity) {
          return await entity.remove();
     }
     return null;
};
