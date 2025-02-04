"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unites = void 0;
const sequelize_1 = require("sequelize");
const connecte_1 = require("../__databases/connecte");
exports.Unites = connecte_1.connect.define('__tbl_ecom_unitesmesures', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    unity: sequelize_1.DataTypes.STRING,
    description: sequelize_1.DataTypes.STRING,
    equival_kgs: sequelize_1.DataTypes.FLOAT
}, { paranoid: true, timestamps: false, freezeTableName: true });
exports.Unites.sync({ alter: true })
    .then(() => {
    console.log('=======> Cerated done `table Unites` ');
})
    .catch((error) => {
    console.error('Une erreur s\'est produite lors de la création de la table :', error);
});
