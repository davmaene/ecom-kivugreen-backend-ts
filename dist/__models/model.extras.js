"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Extras = void 0;
const sequelize_1 = require("sequelize");
const connecte_1 = require("../__databases/connecte");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { APP_ESCAPESTRING } = process.env;
exports.Extras = connecte_1.connect.define('__tbl_ecom_extras', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true
    },
    // carte: {
    //     type: DataTypes.STRING,
    //     allowNull: true,
    //     unique: true,
    //     defaultValue: randomLongNumber({ length: 19 })
    // },
    // date_expiration: {
    //     type: DataTypes.STRING,
    //     allowNull: true,
    //     defaultValue: APP_ESCAPESTRING
    // },
    // date_expiration_unix: {
    //     type: DataTypes.STRING,
    //     allowNull: true,
    //     defaultValue: APP_ESCAPESTRING
    // },
    id_user: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    verification: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: APP_ESCAPESTRING
    },
    lastlogin: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: APP_ESCAPESTRING
    },
}, { paranoid: true, timestamps: true });
exports.Extras.sync({ alter: true })
    .then(() => {
    console.log('=======> Cerated done `table Extras` ');
})
    .catch((error) => {
    console.error('Une erreur s\'est produite lors de la création de la table :', error);
});
