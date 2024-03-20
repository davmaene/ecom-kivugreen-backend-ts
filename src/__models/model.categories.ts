import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { ICategorie } from '../__enums/enum.interfacemodels';

export interface Category extends Model<ICategorie>, ICategorie { }

export const Categories = connect.define<Category>('__tbl_ecom_categories', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    category: DataTypes.STRING,
    description: DataTypes.STRING

}, { paranoid: true, timestamps: false, freezeTableName: true });

Categories.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Categories` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
