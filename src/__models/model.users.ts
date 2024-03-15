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
    phone: {
        type: DataTypes.STRING,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true
    },
    date_naiss: DataTypes.STRING,
    sexe: DataTypes.STRING,
    province: DataTypes.STRING,
    territoire: DataTypes.STRING,
    village: DataTypes.STRING,
    hectare_cultive: DataTypes.STRING,
    isvalidated: DataTypes.INTEGER,
    uuid: DataTypes.STRING,
    password: DataTypes.STRING

}, {
    paranoid: true,
    timestamps: true,
    // indexes: [
    //     {
    //         unique: true,
    //         fields: ['phone', 'email']
    //     }
    // ]
});
