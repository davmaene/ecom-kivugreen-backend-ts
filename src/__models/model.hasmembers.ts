import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { IHasmember, IHasrole, IRoles, IUsers } from '__enums/enum.interfacemodels';
import { Users } from './model.users';
import { randomLongNumber } from '../__helpers/helper.random';
import dotenv from 'dotenv';
import { now } from '../__helpers/helper.moment';
import { Cooperatives } from './model.cooperatives';

dotenv.config()

const { APP_ESCAPESTRING } = process.env

export interface Hasmember extends Model<IHasmember>, IHasmember { }

export const Hasmembers = connect.define<Hasmember>('__tbl_ecom_hasmembers', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    is_payed: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    carte: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        defaultValue: randomLongNumber({ length: 12 })
    },
    date_expiration: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: APP_ESCAPESTRING
    },
    date_expiration_unix: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: APP_ESCAPESTRING
    },
    TblEcomUserId: {
        type: DataTypes.INTEGER,
        references: {
            model: Users,
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
            fields: ['TblEcomCooperativeId', 'TblEcomUserId']
        }
    ]
});

Hasmembers.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Hasmembers` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
