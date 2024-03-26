"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Produits = void 0;
const sequelize_1 = require("sequelize");
const connecte_1 = require("../__databases/connecte");
exports.Produits = connecte_1.connect.define('__tbl_ecom_produits', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    produit: {
        type: sequelize_1.DataTypes.STRING,
        unique: true
    },
    image: sequelize_1.DataTypes.STRING,
    id_unity: sequelize_1.DataTypes.INTEGER,
    id_category: sequelize_1.DataTypes.INTEGER,
    id_souscategory: sequelize_1.DataTypes.INTEGER,
    description: sequelize_1.DataTypes.STRING,
    createdby: sequelize_1.DataTypes.INTEGER,
}, { paranoid: true, timestamps: false, freezeTableName: true });
exports.Produits.sync({ alter: true })
    .then(() => {
    console.log('=======> Cerated done `table Produits` ');
})
    .catch((error) => {
    console.error('Une erreur s\'est produite lors de la création de la table :', error);
});
