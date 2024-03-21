"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hasmembers = void 0;
const sequelize_1 = require("sequelize");
const connecte_1 = require("../__databases/connecte");
const model_roles_1 = require("./model.roles");
const model_users_1 = require("./model.users");
exports.Hasmembers = connecte_1.connect.define('__tbl_ecom_hasmembers', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    TblEcomUserId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: model_users_1.Users,
            key: 'id'
        }
    },
    TblEcomCooperativeId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: model_roles_1.Roles,
            key: 'id'
        }
    }
}, {
    paranoid: false,
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['TblEcomCooperativeId', 'TblEcomUserId']
        }
    ]
});
exports.Hasmembers.sync({ alter: true })
    .then(() => {
    console.log('=======> Cerated done `table Hasmembers` ');
})
    .catch((error) => {
    console.error('Une erreur s\'est produite lors de la création de la table :', error);
});
