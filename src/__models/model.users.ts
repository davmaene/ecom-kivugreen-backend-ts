import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { IUsers } from '__enums/enum.interfacemodels';

export interface User extends Model<IUsers>, IUsers { }

export const Users = connect.define<User>('__tbl_ecom_users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    nom: DataTypes.STRING,
    postnom: DataTypes.STRING,
    prenom: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    date_naiss: DataTypes.STRING,
    sexe: DataTypes.STRING,
    province: DataTypes.STRING,
    territoire: DataTypes.STRING,
    village: DataTypes.STRING,
    hectare_cultive: DataTypes.STRING,
    isvalidated: DataTypes.INTEGER,
    uuid: DataTypes.STRING,
    password: DataTypes.STRING

}, { paranoid: true, timestamps: true });
