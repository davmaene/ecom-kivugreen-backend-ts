"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Provinces = void 0;
const sequelize_1 = require("sequelize");
const connecte_1 = require("../__databases/connecte");
exports.Provinces = connecte_1.connect.define('__tbl_ecom_provinces', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    province: sequelize_1.DataTypes.STRING,
    createdon: sequelize_1.DataTypes.STRING,
    status: sequelize_1.DataTypes.INTEGER,
}, { paranoid: true, timestamps: false, freezeTableName: true });
exports.Provinces.sync({ alter: true })
    .then(() => {
    console.log('=======> Cerated done `table Provinces` ');
})
    .catch((error) => {
    console.error('Une erreur s\'est produite lors de la création de la table :', error);
});
