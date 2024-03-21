"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commandes = void 0;
const sequelize_1 = require("sequelize");
const connecte_1 = require("../__databases/connecte");
exports.Commandes = connecte_1.connect.define('__tbl_ecom_commandes', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    id_produit: sequelize_1.DataTypes.INTEGER,
    qte: sequelize_1.DataTypes.INTEGER,
    prix_achat: sequelize_1.DataTypes.FLOAT,
    currency: sequelize_1.DataTypes.STRING,
    payament_phone: sequelize_1.DataTypes.STRING,
    type_livraison: sequelize_1.DataTypes.INTEGER,
    description: sequelize_1.DataTypes.STRING,
    is_pending: sequelize_1.DataTypes.INTEGER,
    state: sequelize_1.DataTypes.INTEGER
}, { paranoid: true, timestamps: false, freezeTableName: true });
exports.Commandes.sync({ alter: true })
    .then(() => {
    console.log('=======> Cerated done `table Commandes` ');
})
    .catch((error) => {
    console.error('Une erreur s\'est produite lors de la création de la table :', error);
});
