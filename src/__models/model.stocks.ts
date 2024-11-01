import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { IRoles, IStocks, IUsers } from '__enums/enum.interfacemodels';
import dotenv from 'dotenv';
import { now } from '../__helpers/helper.moment';

dotenv.config()

const { APP_ESCAPESTRING } = process.env

export interface Stock extends Model<IStocks>, IStocks { }

export const Stocks = connect.define<Stock>('__tbl_ecom_stocks', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    id_cooperative: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    transaction: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    // items: {
    //     type: DataTypes.JSON,
    //     allowNull: true,
    //     defaultValue: []
    // },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: APP_ESCAPESTRING
    },
    createdby: DataTypes.INTEGER,
    date_expiration: DataTypes.STRING,
    date_production: DataTypes.STRING,
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: new Date() || now({ options: {} }),
        allowNull: true
    }

}, { paranoid: true, timestamps: true });

Stocks.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Stocks` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
