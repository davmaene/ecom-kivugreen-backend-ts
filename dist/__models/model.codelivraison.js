"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Codelivraisons = void 0;
const sequelize_1 = require("sequelize");
const connecte_1 = require("../__databases/connecte");
const helper_moment_1 = require("../__helpers/helper.moment");
const dotenv_1 = __importDefault(require("dotenv"));
const helper_random_1 = require("../__helpers/helper.random");
dotenv_1.default.config();
const { APP_ESCAPESTRING } = process.env;
exports.Codelivraisons = connecte_1.connect.define('__tbl_ecom_codelivraisons', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    id_transaction: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 1,
        unique: true,
        allowNull: false
    },
    id_livreur: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 2,
        allowNull: false
    },
    id_customer: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 2,
        allowNull: false
    },
    code_livraison: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: (0, helper_random_1.randomLongNumber)({ length: 6 }),
        allowNull: false
    },
    description: sequelize_1.DataTypes.STRING,
    createdAt: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: (0, helper_moment_1.now)({ options: {} }),
        allowNull: true
    }
}, { paranoid: true, timestamps: false, freezeTableName: true });
exports.Codelivraisons.sync({ alter: true })
    .then(() => {
    console.log('=======> Cerated done `table Codelivraisons` ');
})
    .catch((error) => {
    console.error('Une erreur s\'est produite lors de la création de la table :', error);
});
