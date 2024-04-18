"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cooperatives = void 0;
const sequelize_1 = require("sequelize");
const connecte_1 = require("../__databases/connecte");
exports.Cooperatives = connecte_1.connect.define('__tbl_ecom_cooperatives', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    logo: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: "",
        allowNull: true
    },
    id_territoire: sequelize_1.DataTypes.INTEGER,
    id_province: sequelize_1.DataTypes.INTEGER,
    coordonnees_gps: sequelize_1.DataTypes.STRING,
    adresse: sequelize_1.DataTypes.STRING,
    phone: sequelize_1.DataTypes.STRING,
    email: sequelize_1.DataTypes.STRING,
    num_enregistrement: sequelize_1.DataTypes.STRING,
    file: sequelize_1.DataTypes.STRING,
    isformel: sequelize_1.DataTypes.INTEGER,
    sigle: sequelize_1.DataTypes.STRING,
    cooperative: {
        type: sequelize_1.DataTypes.STRING,
        // unique: true
    },
    id_adjoint: sequelize_1.DataTypes.INTEGER,
    id_responsable: sequelize_1.DataTypes.INTEGER,
    description: sequelize_1.DataTypes.STRING,
    id_category: sequelize_1.DataTypes.INTEGER
}, {
    paranoid: true,
    timestamps: false,
    freezeTableName: true,
    indexes: [
        {
            unique: true,
            fields: ['sigle', 'cooperative']
        }
    ]
});
exports.Cooperatives.sync({ alter: true })
    .then(() => {
    console.log('=======> Cerated done `table Cooperatives` ');
})
    .catch((error) => {
    console.error('Une erreur s\'est produite lors de la création de la table :', error);
});
