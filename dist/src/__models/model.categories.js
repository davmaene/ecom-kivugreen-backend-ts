"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Categories = void 0;
const sequelize_1 = require("sequelize");
const connecte_1 = require("../__databases/connecte");
exports.Categories = connecte_1.connect.define('__tbl_ecom_categories', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    category: sequelize_1.DataTypes.STRING,
    description: sequelize_1.DataTypes.STRING
}, { paranoid: true, timestamps: false, freezeTableName: true });
exports.Categories.sync({ alter: true })
    .then(() => {
    console.log('=======> Cerated done `table Categories` ');
})
    .catch((error) => {
    console.error('Une erreur s\'est produite lors de la création de la table :', error);
});
