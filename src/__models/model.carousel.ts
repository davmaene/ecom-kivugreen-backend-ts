import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { ICarousel } from '../__enums/enum.interfacemodels';
import dotenv from 'dotenv';

dotenv.config()

const { APP_ESCAPESTRING } = process.env

export interface Carousel extends Model<ICarousel>, ICarousel { }

export const Carousels = connect.define<Carousel>('__tbl_ecom_carousels', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    sub_title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    carousel: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    status: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: APP_ESCAPESTRING
    }

}, { paranoid: true, timestamps: true });

Carousels.sync({ alter: true })
    .then(() => {
        console.log('=======> Created done `table Carousels` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
