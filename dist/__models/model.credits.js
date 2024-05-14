"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Credits = void 0;
const sequelize_1 = require("sequelize");
const connecte_1 = require("../__databases/connecte");
exports.Credits = connecte_1.connect.define('__tbl_ecom_credits', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    id_cooperative: sequelize_1.DataTypes.INTEGER,
    createdat: sequelize_1.DataTypes.DATE,
    id_user: sequelize_1.DataTypes.INTEGER,
    montant: sequelize_1.DataTypes.FLOAT,
    currency: sequelize_1.DataTypes.STRING,
    motif: sequelize_1.DataTypes.STRING,
    status: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    periode_remboursement: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false
    }
}, { paranoid: true, timestamps: false, freezeTableName: true });
exports.Credits.sync({ alter: true })
    .then(() => {
    console.log('=======> Cerated done `table Credits` ');
})
    .catch((error) => {
    console.error('Une erreur s\'est produite lors de la création de la table :', error);
});
