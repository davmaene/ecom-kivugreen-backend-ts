import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { IHasrole, IHistoriesstock, IRoles, IUsers } from '__enums/enum.interfacemodels';
import { Roles } from './model.roles';
import { Users } from './model.users';
import { Produits } from './model.produits';
import { Categories } from './model.categories';
import { Unites } from './model.unitemesures';
import { Cooperatives } from './model.cooperatives';

export interface IHistoriesstocks extends Model<IHistoriesstock>, IHistoriesstock { }

export const Historiquesmembersstocks = connect.define<IHistoriesstocks>('__tbl_ecom_historiquesstocks', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    date_production: DataTypes.STRING,
    qte: DataTypes.INTEGER,
    TblEcomUserId: {
        type: DataTypes.INTEGER,
        references: {
            model: Users,
            key: 'id'
        }
    },
    TblEcomProduitId: {
        type: DataTypes.INTEGER,
        references: {
            model: Produits,
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
    TblEcomUnitesmesureId: {
        type: DataTypes.INTEGER,
        references: {
            model: Unites,
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
    // indexes: [
    //     {
    //         unique: true,
    //         fields: ['TblEcomRoleId', 'TblEcomUserId']
    //     }
    // ]
});

Historiquesmembersstocks.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Historiquesmembersstocks` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });

