"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commandes = void 0;
const sequelize_1 = require("sequelize");
const connecte_1 = require("../__databases/connecte");
const helper_moment_1 = require("../__helpers/helper.moment");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { APP_ESCAPESTRING } = process.env;
exports.Commandes = connecte_1.connect.define('__tbl_ecom_commandes', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    id_unity: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false
    },
    id_cooperative: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 2,
        allowNull: false
    },
    transaction: sequelize_1.DataTypes.STRING,
    id_produit: sequelize_1.DataTypes.INTEGER,
    qte: sequelize_1.DataTypes.INTEGER,
    prix_total: sequelize_1.DataTypes.FLOAT,
    prix_unit: sequelize_1.DataTypes.FLOAT,
    currency: sequelize_1.DataTypes.STRING,
    payament_phone: sequelize_1.DataTypes.STRING,
    type_livraison: sequelize_1.DataTypes.INTEGER,
    description: sequelize_1.DataTypes.STRING,
    is_pending: sequelize_1.DataTypes.INTEGER,
    state: sequelize_1.DataTypes.INTEGER, // 0: non paye' | 1: Annuler | 2: Encours de livr | 3: Possibilite liv 4: livree'
    createdby: sequelize_1.DataTypes.INTEGER,
    shipped_to: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: APP_ESCAPESTRING
    },
    createdAt: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: (0, helper_moment_1.now)({ options: {} }),
        allowNull: true
    }
}, { paranoid: true, timestamps: false, freezeTableName: true });
exports.Commandes.sync({ alter: true })
    .then(() => {
    console.log('=======> Cerated done `table Commandes` ');
})
    .catch((error) => {
    console.error('Une erreur s\'est produite lors de la création de la table :', error);
});
