'use strict';
const mapper = require('../mappers/role');
const updateEntities = require('../../helpers/updateEntities');

const set = (model, entity) => {
     return updateEntities.update(model, entity);
};

const getById = async (id) => {
     return await db.role.findById(id);
};

const getByCode = async (code) => {
     return await db.role.findOne({ code });
};

const getByCondition = async (condition) => {
     return await db.role.findOne(condition);
};

exports.create = async (body) => {
     try {
          let entity = await getByCode(body.code);
          if (entity) {
               return entity;
          }
          entity = new db.role(await mapper.newEntity(body));
          return await entity.save();
     } catch (e) {
          throw e;
     }
};

exports.update = async (id, model) => {
     try {
          let entity = await db.role.findById(id);
          set(model, entity);
          return entity.save();
     } catch (err) {
          throw err;
     }
};

exports.search = async (query, page) => {
     try {
          let where = {};
          if (query.search) {
               where['$or'] = [
                    { name: new RegExp(query.search, 'i') },
                    { code: new RegExp(query.search, 'i') },
               ];
          }
          if (query.weight) {
               where.weight = { $lt: Number(query.weight) };
          }

          const count = await db.role.countDocuments(where);
          let items;
          if (page) {
               items = await db.role
                    .find(where)
                    .sort({ name: 1 })
                    .skip(page.skip)
                    .limit(page.limit);
          } else {
               items = await db.role.find(where).sort({ name: 1 });
          }
          return {
               count,
               items,
          };
     } catch (error) {
          throw error;
     }
};

exports.get = async (query) => {
     try {
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
          if (query.code) {
               return getByCondition({
                    code: query.code,
               });
          }
          return null;
     } catch (error) {
          throw error
          
     }
};

exports.remove = async (id) => {
     try {
          let entity = await this.get(id);
          if (entity) {
               return await entity.remove();
          }
          return null;
     } catch (error) {
          throw error;
     }
};

exports.initRoles = async (roleData) => {
     for (let data of roleData) {
          await this.create(data);
     }
};
