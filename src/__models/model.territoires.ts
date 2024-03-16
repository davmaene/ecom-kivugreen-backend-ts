import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { IProvinces, IRoles, ITerritoires, IUsers } from '__enums/enum.interfacemodels';

export interface Territoire extends Model<ITerritoires>, ITerritoires { }

export const Territoires = connect.define<Territoire>('__tbl_ecom_territoires', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    idprovince: DataTypes.STRING,
    territoire: DataTypes.STRING,

}, { paranoid: true, timestamps: false });

Territoires.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Territoires` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
