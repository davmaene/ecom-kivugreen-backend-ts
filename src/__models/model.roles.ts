import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { IRoles, IUsers } from '__enums/enum.interfacemodels';

export interface User extends Model<IRoles>, IRoles { }

export const Roles = connect.define<User>('__tbl_users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    role: DataTypes.STRING,
    description: DataTypes.STRING

}, { paranoid: true, timestamps: true });
