const seeder = require('./seeder');
const roleService = require('../services/roles');
const logger = require('../../helpers/logger');

function initSeed() {
    Promise.all([
        roleService.initRoles(seeder.roleData),
    ]).then(() => {
        logger.info('seeder completed');
    }).catch((err) => {
        logger.error('seeder completed');
    });
}

module.exports = initSeed;