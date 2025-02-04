import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { IProduit } from '../__enums/enum.interfacemodels';
import { now } from '../__helpers/helper.moment';

export interface Produit extends Model<IProduit>, IProduit { }

export const Produits = connect.define<Produit>('__tbl_ecom_produits', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    tva: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: true
    },
    produit: {
        type: DataTypes.STRING,
        unique: true
    },
    image: DataTypes.STRING,
    id_unity: DataTypes.INTEGER,
    id_category: DataTypes.INTEGER,
    id_souscategory: DataTypes.INTEGER,
    description: DataTypes.STRING,
    createdby: DataTypes.INTEGER,
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: new Date() || now({ options: {} }),
        allowNull: true
    }

}, { paranoid: true, timestamps: false, freezeTableName: true });

Produits.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Produits` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
