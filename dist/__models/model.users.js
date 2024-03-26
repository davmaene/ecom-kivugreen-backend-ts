"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = void 0;
const sequelize_1 = require("sequelize");
const connecte_1 = require("../__databases/connecte");
exports.Users = connecte_1.connect.define('__tbl_ecom_users', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    nom: sequelize_1.DataTypes.STRING,
    avatar: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: `assets/as_avatar/defaultavatar.png`
    },
    postnom: sequelize_1.DataTypes.STRING,
    prenom: sequelize_1.DataTypes.STRING,
    phone: {
        type: sequelize_1.DataTypes.STRING,
        unique: true
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        unique: true
    },
    date_naiss: sequelize_1.DataTypes.STRING,
    sexe: sequelize_1.DataTypes.STRING,
    idprovince: sequelize_1.DataTypes.STRING,
    idterritoire: sequelize_1.DataTypes.STRING,
    idvillage: sequelize_1.DataTypes.STRING,
    hectare_cultive: sequelize_1.DataTypes.STRING,
    isvalidated: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0
    },
    uuid: sequelize_1.DataTypes.STRING,
    password: sequelize_1.DataTypes.STRING
}, {
    paranoid: false,
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['phone', 'email']
        }
    ]
});
exports.Users.sync({ alter: true })
    .then(() => {
    console.log('=======> Cerated done `table Users` ');
})
    .catch((error) => {
    console.error('Une erreur s\'est produite lors de la création de la table :', error);
});
