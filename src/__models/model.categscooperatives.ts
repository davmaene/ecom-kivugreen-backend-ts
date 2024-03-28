import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { ICategorie, ICategscoopecs } from '../__enums/enum.interfacemodels';

export interface Category extends Model<ICategscoopecs>, ICategscoopecs { }

export const Categoriescooperatives = connect.define<Category>('__tbl_ecom_categoriescoopecs', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    category: DataTypes.STRING,
    description: DataTypes.STRING

}, { paranoid: true, timestamps: false, freezeTableName: true });

Categoriescooperatives.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Categoriescooperatives` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
