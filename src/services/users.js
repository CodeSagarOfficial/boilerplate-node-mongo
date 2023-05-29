'use strict';
const mapper = require('../mappers/user');
const updateEntities = require('../../helpers/updateEntities');
const profileS = require('../../ship-district/services/profiles');
const _ = require('underscore');
const moment = require('moment')
const populate = [
     {
          path: 'role',
     },
     {
          path: 'profiles',
     },
     {
          path: 'currentProfile',
     },
];

const set = (model, entity) => {
     return updateEntities.update(model, entity);
};

const getById = async (id) => {
     return await db.user.findById(id).populate(populate);
};

const getByCondition = async (condition) => {
     return await db.user.findOne(condition).populate(populate);
};

exports.create = async (model) => {
     try {
          let entity = new db.user(await mapper.newEntity(model));
          return await entity.save();
     } catch (error) {
          throw error;
     }
};

exports.update = async (id, model) => {
     try {
          let entity = await db.user.findById(id).populate(populate);
          set(model, entity);
          return entity.save();
     } catch (error) {
          throw error;
     }
};

exports.search = async (query, page, user) => {
     try {
          let { status, search, accountType, sortOrder, accountSortOrder } = query,
               where = {};
          let order = { createdAt: -1 }
          if (user.role.code == 'SUPER_ADMIN' && user.id) {
               where["_id"] = { $ne: user._id };
          }

          let accountOrder = { updatedAt: -1 }
          if (accountSortOrder) {
               let [key, value] = query.accountSortOrder.split(',')
               accountOrder = {
                    [key]: value === 'ASC' ? 1 : -1
               }
          }

          if (query.date) {
               where.createdAt = {
                    $gte: moment(query.date).startOf('day').format(),
                    $lte: moment(query.date).endOf('day').format(),
               };
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
                         from: 'profiles',
                         localField: 'currentProfile',
                         foreignField: '_id',
                         as: 'currentProfile',
                    },
               },
               {
                    $unwind: {
                         path: '$currentProfile',
                         preserveNullAndEmptyArrays: true,
                    },
               },
               {
                    $lookup: {
                         from: 'profiles',
                         localField: 'profiles',
                         foreignField: '_id',
                         as: 'profiles',
                    },
               },
          ];

          if (search) {
               where['$or'] = [
                    {
                         fullName: new RegExp(search, 'i'),
                    },
                    {
                         email: new RegExp(search, 'i'),
                    },
                    {
                         UniqueId: new RegExp(search, 'i')
                    }
               ];
          }
          if (status) {

               where.status = { $in: status.split(',') };
          }
          if (accountType) {
               where['accountType'] = query.accountType
          }
          if (sortOrder) {
               let [key, value] = query.sortOrder.split(',')
               order = {
                    [key]: value === 'ASC' ? 1 : -1
               }
          }
          let countAggregation = [...model, { $match: where }, { $group: { _id: null, count: { $sum: 1 } } }];
          const count = await db.user.aggregate(countAggregation);
          let items;
          if (page && !accountSortOrder) {
               model.push(
                    { $match: where },
                    { $skip: page.skip },
                    { $limit: page.limit },
                    { $sort: order }
               );
               items = await db.user.aggregate(model);
          } else {
               model.push({ $match: where }, { $sort: order });
               items = await db.user.aggregate(model);
          } if (page && accountSortOrder) {
               model.push(
                    { $match: where },
                    { $skip: page.skip },
                    { $limit: page.limit },
                    { $sort: accountOrder }
               );
               items = await db.user.aggregate(model);
          } else {
               model.push({ $match: where }, { $sort: accountOrder });
               items = await db.user.aggregate(model);
          }
          return {
               count: _.isEmpty(count) ? 0 : count[0].count,
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
               return getByCondition({ name: query.name });
          }
          return null;
     } catch (error) {
          throw error;
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

exports.switchProfile = async (id, model) => {
     try {
          let entity = await db.user.findById(id);
          let profile = await db.profile.findById(model.profileId);
          if (
               profile.accountType === 'virtualMailBox' &&
               profile.isMailBoxAccountVerified === false
          )
               throw 'your mail box account is not verified yet';
          if (!entity || !entity.profiles.includes(model.profileId))
               throw 'cannot switch profile is incorrect value';
          if (entity && Array.isArray(entity.profiles)) {
               entity.currentProfile = model.profileId;
               await entity.save();
          }
          return await this.get(id);
     } catch (error) {
          throw error;
     }
};

exports.updateCarrier = async (id, model) => {
     try {
          let user = await db.user.findById(id);
          if (
               user &&
               Array.isArray(user.profiles) &&
               user.profiles.length > 0
          ) {
               for (const profileId of user.profiles) {
                    await db.profile.findByIdAndUpdate(profileId, {
                         carrier: model.carrier,
                    });
               }
          }
          return await this.get(id);
     } catch (error) {
          throw error;
     }
};

exports.createProfile = async (id, model) => {
     try {
          let user = await db.user.findById(id).populate(populate);
          if (!user) throw 'user not found';
          if (model.type === 'update') {
               // user.accountType = 'both'
               user.fullName = model.name || user.fullName;
               user.accountType = model.accountType || user.accountType;
               delete model.accountType;
               await Promise.all(
                    user.profiles.map((profile) =>
                         profileS.update(profile.id, model)
                    )
               );
               await user.save();
               return await this.get(id);
          }

          if (user.profiles.length == 1 || user.profiles.length == 2) {
               user.profiles.map(async (item) => await profileS.update(item.id, model));
               // user.accountType = 'both'
               await user.save()
               return await user
          } else if (
               user.profiles.some(item => item.accountType == model.accountType)
          ) {
               throw 'profile already created';
          }
          if (user.profiles.length == 2) {
               user.accountType = 'both'
               await user.save();
          }
          if (user.profiles.length == 1) {
               let profile = db.profile.findById(user.profiles[0].id)
               if (profile.accountType == 'shipment') {
                    user.accountType = 'shipment'
                    await user.save();
               }
               if (profile.accountType == 'virtualMailBox') {
                    user.accountType = 'virtualMailBox'
                    await user.save();
               }
          }
          model.userId = user.id || user._id;
          // user.accountType = 'both'
          await user.save()
          await profileS.create(model);
          return await this.get(user.id);
     } catch (error) {
          throw error;
     }
};
