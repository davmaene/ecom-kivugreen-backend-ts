import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { IBank, IRoles, IStocks, IUsers } from '__enums/enum.interfacemodels';
import dotenv from 'dotenv';
import { now } from '../__helpers/helper.moment';

dotenv.config()

const { APP_ESCAPESTRING } = process.env

export interface Bank extends Model<IBank>, IBank { }

export const Banks = connect.define<Bank>('__tbl_ecom_banks', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    id_responsable: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: APP_ESCAPESTRING
    },
    createdby: DataTypes.INTEGER,
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    bank: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: new Date() || now({ options: {} }),
        allowNull: true
    }

}, { paranoid: true, timestamps: true });

Banks.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Banks` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
