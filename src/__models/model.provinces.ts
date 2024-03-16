import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { IProvinces, IRoles, IUsers } from '__enums/enum.interfacemodels';

export interface Province extends Model<IProvinces>, IProvinces { }

export const Provinces = connect.define<Province>('__tbl_ecom_provinces', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    province: DataTypes.STRING,
    createdon: DataTypes.STRING,
    status: DataTypes.INTEGER,

}, { paranoid: true, timestamps: false, freezeTableName: true });

Provinces.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Provinces` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
