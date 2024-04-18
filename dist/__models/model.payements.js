"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Paiements = void 0;
const sequelize_1 = require("sequelize");
const connecte_1 = require("../__databases/connecte");
exports.Paiements = connecte_1.connect.define('__tbl_ecom_payements', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    realref: sequelize_1.DataTypes.STRING,
    reference: sequelize_1.DataTypes.STRING,
    phone: sequelize_1.DataTypes.STRING,
    amount: sequelize_1.DataTypes.FLOAT,
    currency: sequelize_1.DataTypes.STRING,
    category: sequelize_1.DataTypes.INTEGER,
    description: sequelize_1.DataTypes.STRING,
    createdby: sequelize_1.DataTypes.INTEGER
}, { paranoid: true, timestamps: false, freezeTableName: true });
exports.Paiements.sync({ alter: true })
    .then(() => {
    console.log('=======> Cerated done `table Paiements` ');
})
    .catch((error) => {
    console.error('Une erreur s\'est produite lors de la création de la table :', error);
});
