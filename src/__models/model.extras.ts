import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { IExtras, IRoles, IUsers } from '__enums/enum.interfacemodels';
import dotenv from 'dotenv';

dotenv.config()

const { APP_ESCAPESTRING } = process.env

export interface Extra extends Model<IExtras>, IExtras { }

export const Extras = connect.define<Extra>('__tbl_ecom_extras', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true
    },
    id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    verification: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: APP_ESCAPESTRING
    },
    lastlogin: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: APP_ESCAPESTRING
    }

}, { paranoid: true, timestamps: true });

Extras.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Extras` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });