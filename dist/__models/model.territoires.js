"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Territoires = void 0;
const sequelize_1 = require("sequelize");
const connecte_1 = require("../__databases/connecte");
exports.Territoires = connecte_1.connect.define('__tbl_ecom_territoires', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    idprovince: sequelize_1.DataTypes.INTEGER,
    territoire: sequelize_1.DataTypes.STRING,
}, { paranoid: true, timestamps: false });
exports.Territoires.sync({ alter: true })
    .then(() => {
    console.log('=======> Cerated done `table Territoires` ');
})
    .catch((error) => {
    console.error('Une erreur s\'est produite lors de la création de la table :', error);
});
