"use strict";
const dbConfig = require("config").get("mongodb");
const logger = require('../helpers/logger');
let mongoose = require("mongoose");
const camelcase = require("camelcase");
const findOrCreate = require("findorcreate-promise");

let onboardingModels = require("../onboarding/models");

module.exports.configure = () => {
    mongoose.Promise = global.Promise;
    mongoose.plugin(findOrCreate);

    let connect = function () {
        let config = JSON.parse(JSON.stringify(dbConfig));

        if (config.options) {
            config.options.promiseLibrary = global.Promise;
        }

        logger.info("connecting to", dbConfig);
        mongoose.connect(config.host, config.options);
    };
    connect();

    let db = mongoose.connection;

    db.on("connected", function () {
        logger.info("mongo Connected");
    });

    db.on("error", function (err) {
        logger.info("connection error: " + err);
    });

    db.on("disconnected", function () {
        logger.info("connecting again");
        connect();
    });
    let models = [...onboardingModels.retrieveModels()];

    models.forEach((model) => {
        let schema = new mongoose.Schema(model.entity, { usePushEach: true });

        schema.pre("save", function (next) {
            this.timestamps = true;
            next();
        });

        mongoose.model(camelcase(model.name), schema);
    })
    global.db = mongoose.models;

    return global.db;
};