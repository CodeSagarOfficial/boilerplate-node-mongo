require('dotenv').config();
const app = require('./settings/express');
var logger = require('./helpers/logger')();
const webServer = require("config").get("webServer");

server = app.listen(webServer.port, () => {
    logger.info(`Listening to port ${webServer.port}`);
    console.log(`Listening to port ${webServer.port}`);
});

const exitHandler = () => {
    if (server) {
        server.close(() => {
        logger.info('Server closed');
        process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

const unexpectedErrorHandler = (error) => {
    logger.error(error);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    if (server) {
        server.close();
    }
});
