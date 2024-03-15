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
    province: DataTypes.STRING

}, { paranoid: true, timestamps: true });
