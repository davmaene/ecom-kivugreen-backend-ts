import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { IExtras, IRoles, IUsers } from '__enums/enum.interfacemodels';
import dotenv from 'dotenv';
import { randomLongNumber } from '../__helpers/helper.random';

dotenv.config()

const { APP_ESCAPESTRING } = process.env

export interface Extra extends Model<IExtras>, IExtras { }

export const Extras = connect.define<Extra>('__tbl_ecom_extras', { // as carte membre
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true
    },
    carte: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        defaultValue: randomLongNumber({ length: 19 })
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
    },

}, { paranoid: true, timestamps: true });

Extras.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Extras` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
