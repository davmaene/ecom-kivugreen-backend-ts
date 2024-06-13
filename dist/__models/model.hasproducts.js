"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hasproducts = void 0;
const sequelize_1 = require("sequelize");
const connecte_1 = require("../__databases/connecte");
const model_produits_1 = require("./model.produits");
const model_cooperatives_1 = require("./model.cooperatives");
const model_categories_1 = require("./model.categories");
const model_unitemesures_1 = require("./model.unitemesures");
const model_stocks_1 = require("./model.stocks");
exports.Hasproducts = connecte_1.connect.define('__tbl_ecom_hasproducts', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    qte_critique: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    tva: {
        type: sequelize_1.DataTypes.FLOAT,
        defaultValue: 0
    },
    id_membre: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    date_production: sequelize_1.DataTypes.STRING,
    qte: sequelize_1.DataTypes.INTEGER,
    prix_unitaire: sequelize_1.DataTypes.FLOAT,
    prix_plus_commission: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0.0
    },
    currency: sequelize_1.DataTypes.STRING,
    TblEcomProduitId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: model_produits_1.Produits,
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
    TblEcomStockId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: model_stocks_1.Stocks,
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
    TblEcomCooperativeId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: model_cooperatives_1.Cooperatives,
            key: 'id'
        }
    }
}, {
    paranoid: false,
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['TblEcomCooperativeId', 'TblEcomProduitId']
        }
    ]
});
exports.Hasproducts.sync({ alter: true })
    .then(() => {
    console.log('=======> Cerated done `table Hasproducts` ');
})
    .catch((error) => {
    console.error('Une erreur s\'est produite lors de la création de la table :', error);
});
