"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Typelivraisons = void 0;
const sequelize_1 = require("sequelize");
const connecte_1 = require("../__databases/connecte");
exports.Typelivraisons = connecte_1.connect.define('__tbl_ecom_typelivraisons', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    type: sequelize_1.DataTypes.STRING,
    description: sequelize_1.DataTypes.STRING
}, { paranoid: true, timestamps: false, freezeTableName: true });
exports.Typelivraisons.sync({ alter: true })
    .then(() => {
    console.log('=======> Cerated done `table Typelivraisons` ');
})
    .catch((error) => {
    console.error('Une erreur s\'est produite lors de la création de la table :', error);
});
