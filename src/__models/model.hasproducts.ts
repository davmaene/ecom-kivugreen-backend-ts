import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { IHasmember, IHasproducts, IHasrole, IRoles, IUsers } from '__enums/enum.interfacemodels';
import { Produits } from './model.produits';
import { Cooperatives } from './model.cooperatives';
import { Categories } from './model.categories';
import { Unites } from './model.unitemesures';
import { Stocks } from './model.stocks';

export interface Hasproduit extends Model<IHasproducts>, IHasproducts { }

export const Hasproducts = connect.define<Hasproduit>('__tbl_ecom_hasproducts', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
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
    TblEcomCategorieId: {
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
