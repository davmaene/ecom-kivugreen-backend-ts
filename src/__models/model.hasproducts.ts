import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { IHasproducts } from '__enums/enum.interfacemodels';
import { Produits } from './model.produits';
import { Cooperatives } from './model.cooperatives';
import { Categories } from './model.categories';
import { Unites } from './model.unitemesures';
import { Stocks } from './model.stocks';
import { now } from '../__helpers/helper.moment';

export interface Hasproduit extends Model<IHasproducts>, IHasproducts { }

export const Hasproducts = connect.define<Hasproduit>('__tbl_ecom_hasproducts', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    qte_critique: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    tva: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    id_membre: {
        type: DataTypes.JSON,
        defaultValue: 0,
        allowNull: true
    },
    date_production: DataTypes.STRING,
    qte: DataTypes.INTEGER,
    prix_unitaire: DataTypes.FLOAT,
    prix_plus_commission: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0.0
    },
    currency: DataTypes.STRING,
    TblEcomProduitId: {
        type: DataTypes.INTEGER,
        references: {
            model: Produits,
            key: 'id'
        }
    },
    TblEcomUnitesmesureId: {
        type: DataTypes.INTEGER,
        references: {
            model: Unites,
            key: 'id'
        }
    },
    TblEcomStockId: {
        type: DataTypes.INTEGER,
        references: {
            model: Stocks,
            key: 'id'
        }
    },
    TblEcomCategoryId: {
        type: DataTypes.INTEGER,
        references: {
            model: Categories,
            key: 'id'
        }
    },
    TblEcomCooperativeId: {
        type: DataTypes.INTEGER,
        references: {
            model: Cooperatives,
            key: 'id'
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: new Date() || now({ options: {} }),
        allowNull: true
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

Hasproducts.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Hasproducts` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
