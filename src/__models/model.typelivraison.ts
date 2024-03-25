import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { ICategorie, ITypelivraison } from '../__enums/enum.interfacemodels';

export interface Type extends Model<ITypelivraison>, ITypelivraison { }

export const Typelivraisons = connect.define<Type>('__tbl_ecom_typelivraisons', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    type: DataTypes.STRING,
    description: DataTypes.STRING

}, { paranoid: true, timestamps: false, freezeTableName: true });

Typelivraisons.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Typelivraisons` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
