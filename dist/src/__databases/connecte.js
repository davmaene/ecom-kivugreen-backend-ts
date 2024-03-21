"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("./database"));
const database = database_1.default.getInstance();
const { dbName, username, password, logging, dialect, host, port } = database;
exports.connect = new sequelize_1.Sequelize(dbName, username, password, {
    port,
    host,
    dialect,
    logging,
    retry: {
        match: [/Deadlock/i],
        max: 3,
        backoffBase: 1000,
        backoffExponent: 1.5
    },
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});
exports.connect
    .authenticate()
    .then(() => {
    // console.log("Connected successfuly to db ..." + dbName, ' on port ==> ', port);
    // connect
    //     .sync({ alter: true, force: true })
    //     .then(() => {
    //         console.log("Models were synchronized successfully to DB ====> " + dbName);
    //     })
    //     .catch((error) => {
    //         console.log(`Failed to sync all models ${error.message}`);
    //     });
})
    .catch((error) => {
    console.log(`Failed to connect to bd ${error}`);
});
