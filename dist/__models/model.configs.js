"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configs = void 0;
const sequelize_1 = require("sequelize");
const connecte_1 = require("../__databases/connecte");
exports.Configs = connecte_1.connect.define('__tbl_ecom_configs', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    taux_change: sequelize_1.DataTypes.FLOAT,
    commission_price: sequelize_1.DataTypes.FLOAT
}, { paranoid: true, timestamps: false, freezeTableName: true });
exports.Configs.sync({ alter: true })
    .then(() => {
    console.log('=======> Cerated done `table Configs` ');
})
    .catch((error) => {
    console.error('Une erreur s\'est produite lors de la création de la table :', error);
});
