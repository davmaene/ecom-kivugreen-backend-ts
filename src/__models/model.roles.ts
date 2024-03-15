import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { IRoles, IUsers } from '__enums/enum.interfacemodels';

export interface Role extends Model<IRoles>, IRoles { }

export const Roles = connect.define<Role>('__tbl_ecom_roles', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    role: DataTypes.STRING,
    description: DataTypes.STRING

}, { paranoid: true, timestamps: true });
