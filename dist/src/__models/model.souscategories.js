"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Souscategories = void 0;
const sequelize_1 = require("sequelize");
const connecte_1 = require("../__databases/connecte");
exports.Souscategories = connecte_1.connect.define('__tbl_ecom_souscategories', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    souscategory: sequelize_1.DataTypes.STRING,
    id_category: sequelize_1.DataTypes.INTEGER,
    description: sequelize_1.DataTypes.STRING
}, { paranoid: true, timestamps: false, freezeTableName: true });
exports.Souscategories.sync({ alter: true })
    .then(() => {
    console.log('=======> Cerated done `table Souscategories` ');
})
    .catch((error) => {
    console.error('Une erreur s\'est produite lors de la création de la table :', error);
});
