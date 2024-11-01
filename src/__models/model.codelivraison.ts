import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { ICommande, IValidatorcodeondelivery } from '../__enums/enum.interfacemodels';
import { now } from '../__helpers/helper.moment';

import dotenv from 'dotenv';
import { randomLongNumber } from '../__helpers/helper.random';

dotenv.config()

const { APP_ESCAPESTRING } = process.env

export interface Codes extends Model<IValidatorcodeondelivery>, IValidatorcodeondelivery { }

export const Codelivraisons = connect.define<Codes>('__tbl_ecom_codelivraisons', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    id_transaction: {
        type: DataTypes.STRING,
        defaultValue: 1,
        unique: true,
        allowNull: false
    },
    id_livreur: {
        type: DataTypes.INTEGER,
        defaultValue: 2,
        allowNull: false
    },
    id_customer: {
        type: DataTypes.INTEGER,
        defaultValue: 2,
        allowNull: false
    },
    code_livraison: {
        type: DataTypes.STRING,
        defaultValue: randomLongNumber({ length: 6 }),
        allowNull: false
    },
    description: DataTypes.STRING,
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: new Date() || now({ options: {} }),
        allowNull: true
    }

}, { paranoid: true, timestamps: false, freezeTableName: true });

Codelivraisons.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Codelivraisons` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
