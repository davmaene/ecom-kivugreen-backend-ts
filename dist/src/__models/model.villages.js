"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Villages = void 0;
const sequelize_1 = require("sequelize");
const connecte_1 = require("../__databases/connecte");
exports.Villages = connecte_1.connect.define('__tbl_ecom_villages', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    idterritoire: sequelize_1.DataTypes.STRING,
    village: sequelize_1.DataTypes.STRING,
    latitude: sequelize_1.DataTypes.STRING,
    longitude: sequelize_1.DataTypes.STRING,
    groupement: sequelize_1.DataTypes.STRING,
    provincecode: sequelize_1.DataTypes.STRING
}, { paranoid: true, timestamps: false, freezeTableName: true });
exports.Villages.sync({ alter: true })
    .then(() => {
    console.log('=======> Cerated done `table Villages` ');
})
    .catch((error) => {
    console.error('Une erreur s\'est produite lors de la création de la table :', error);
});
