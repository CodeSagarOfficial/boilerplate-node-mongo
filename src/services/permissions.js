const mapper = require('../mappers/permission');
const lodash = require('lodash');
const updateEntities = require('../../helpers/updateEntities');

exports.create = async (model) => {
     try {
          let entity = new db.permission(await mapper.newEntity(model));
          
          return await entity.save();
     } catch (error) {
          throw error;
     }
};

const set = (model, entity) => {
     return updateEntities.update(model, entity);
};

const getById = async (id) => {
     return await db.permission.findById(id);
};

const getByCondition = async (condition) => {
     return await db.permission.findOne(condition);
};

exports.update = async (id, model) => {
     try {
          let entity = await db.permission.findById(id);
          set(model, entity);
          return entity.save();
     } catch (err) {
          throw err;
     }
};

exports.search = async (query, page) => {
     let where = {};
     if (query.name) {
          where['$or'] = [
               {
                    name: { $regex: query.name, $options: 'i' },
               },
               {
                    route: { $regex: query.name, $options: 'i' },
               },
               
          ];
     }
     let model = [
          {
               $lookup: {
                    from: 'roles',
                    localField: 'role',
                    foreignField: '_id',
                    as: 'role',
               },
          },
          {
               $unwind: {
                    path: '$role',
                    preserveNullAndEmptyArrays: true,
               },
          },
          {
               $lookup: {
                    from: 'businesses',
                    localField: 'business',
                    foreignField: '_id',
                    as: 'business',
               },
          },
          {
               $unwind: {
                    path: '$business',
                    preserveNullAndEmptyArrays: true,
               },
          },
     ];
     const count = await db.permission.countDocuments(where);
     let items;
     if (page) {
          model.push(
               { $match: where },
               { $skip: page.skip },
               { $limit: page.limit },
               { $sort: { 'timeStamp': -1 } }
          );
          items = await db.permission.aggregate(model);
     } else {
          model.push({ $match: where }, { $sort: { 'timeStamp': -1 } });
          items = await db.permission.aggregate(model);
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

exports.initPermissions = async (routeList) => {
     if (routeList && routeList.length) {
         try {
               const roles = await db.role.find();
               const permissions = lodash.map(routeList, (route, key) =>
                    new Promise(async (resolve, reject) => {
                         try {
                              if (route.hasOwnProperty('descriptor') && route.descriptor.length && !lodash.isUndefined(lodash.first(route.descriptor)) && !lodash.isNull(lodash.first(route.descriptor))) {
                                   const modules = storeModules(route, roles);
                                   if (modules){
                                        Promise.all(modules).then((result) => {
                                             resolve();
                                        });
                                   }
                              } else {
                                   resolve();
                              }
                         } catch (e) {
                              return reject(e);
                         }
                    })
               );
               Promise.all(permissions).then((result) => {
                    console.log('Store routes completed!');
               }).catch((error) => {
                    console.log('Store routes failed!', error);
               });
         } catch (e) {
             console.log('Store routes failed!', e);
         }
     } else {
         console.log('Something went wrong, please try again later.!');
     }
};

const storeModules = (route, roles) => {
     lodash.map(route.descriptor, (descriptor, key) => {
          new Promise(async (resolve, reject) => {
               try {
                    if (descriptor) {
                         let permission = await db.permission.findOne({ name: descriptor.name });
                         let data = {
                              name: descriptor.name,
                              route: route.path
                         };
                         if (!permission) {
                              permission = await new db.permission(data).save();
                         }
                         for (let [roleKey, role] of Object.entries(roles)) {
                              data = {
                                   permission: permission.id,
                                   permissionId: permission.id,
                                   role: role.id,
                                   roleId: role.id
                              };
     
                              const rolePermission = await db.rolePermission.findOne(data);
     
                              if (!rolePermission) {
                                   await new db.rolePermission(data).save();
                              }
                         }
                         resolve();
                    } else {
                         resolve();
                    }
     
               } catch (e) {
                    return reject(e);
               }
     
          })
     }     
 );
}