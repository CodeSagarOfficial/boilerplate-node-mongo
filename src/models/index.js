"use strict";
const fs = require("fs");

exports.retrieveModels = () => {
  let models = [];
  // set all the models on db

  fs.readdirSync(__dirname).forEach(function (file) {
    if (file.indexOf(".js") && file.indexOf("index.js") < 0) {
      let name = file.split(".")[0];
      let entity = require("./" + file);
      // entity.timeStamp = {
      //   type: Date,
      //   default: Date.now,
      // };
      models.push({ name, entity })
    }
  });
  return models;
};

