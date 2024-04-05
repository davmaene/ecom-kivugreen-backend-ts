"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Newsletters = void 0;
const sequelize_1 = require("sequelize");
const connecte_1 = require("../__databases/connecte");
exports.Newsletters = connecte_1.connect.define('__tbl_ecom_newsletters', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        unique: true
    },
    description: sequelize_1.DataTypes.TEXT
}, { paranoid: true, timestamps: false, freezeTableName: true });
exports.Newsletters.sync({ alter: true })
    .then(() => {
    console.log('=======> Cerated done `table Newsletters` ');
})
    .catch((error) => {
    console.error('Une erreur s\'est produite lors de la création de la table :', error);
});
