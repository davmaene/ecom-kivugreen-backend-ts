"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Historiquesmembersstocks = void 0;
const sequelize_1 = require("sequelize");
const connecte_1 = require("../__databases/connecte");
const model_users_1 = require("./model.users");
const model_produits_1 = require("./model.produits");
const model_categories_1 = require("./model.categories");
const model_unitemesures_1 = require("./model.unitemesures");
const model_cooperatives_1 = require("./model.cooperatives");
const model_stocks_1 = require("./model.stocks");
exports.Historiquesmembersstocks = connecte_1.connect.define('__tbl_ecom_historiquesstocks', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    date_production: sequelize_1.DataTypes.STRING,
    qte: sequelize_1.DataTypes.INTEGER,
    TblEcomUserId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: model_users_1.Users,
            key: 'id'
        }
    },
    TblEcomProduitId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: model_produits_1.Produits,
            key: 'id'
        }
    },
    TblEcomCategoryId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: model_categories_1.Categories,
            key: 'id'
        }
    },
    TblEcomUnitesmesureId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: model_unitemesures_1.Unites,
            key: 'id'
        }
    },
    TblEcomCooperativeId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: model_cooperatives_1.Cooperatives,
            key: 'id'
        }
    },
    TblEcomStockId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: model_stocks_1.Stocks,
            key: 'id'
        }
    }
}, {
    paranoid: false,
    timestamps: true,
    // indexes: [
    //     {
    //         unique: true,
    //         fields: ['TblEcomRoleId', 'TblEcomUserId']
    //     }
    // ]
});
exports.Historiquesmembersstocks.sync({ alter: true })
    .then(() => {
    console.log('=======> Cerated done `table Historiquesmembersstocks` ');
})
    .catch((error) => {
    console.error('Une erreur s\'est produite lors de la création de la table :', error);
});
