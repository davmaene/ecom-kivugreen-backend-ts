"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Roles = void 0;
const sequelize_1 = require("sequelize");
const connecte_1 = require("../__databases/connecte");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { APP_ESCAPESTRING } = process.env;
exports.Roles = connecte_1.connect.define('__tbl_ecom_roles', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    role: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: APP_ESCAPESTRING
    }
}, { paranoid: true, timestamps: true });
exports.Roles.sync({ alter: true })
    .then(() => {
    console.log('=======> Cerated done `table Roles` ');
})
    .catch((error) => {
    console.error('Une erreur s\'est produite lors de la création de la table :', error);
});
