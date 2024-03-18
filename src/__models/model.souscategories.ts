import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { ICategorie, IProvinces, IRoles, ISCategorie, IUsers } from '../__enums/enum.interfacemodels';

export interface Souscategory extends Model<ISCategorie>, ICategorie { }

export const Souscategories = connect.define<Souscategory>('__tbl_ecom_souscategories', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    souscategory: DataTypes.STRING,
    id_category: DataTypes.INTEGER,
    description: DataTypes.STRING

}, { paranoid: true, timestamps: false, freezeTableName: true });

Souscategories.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Souscategories` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
