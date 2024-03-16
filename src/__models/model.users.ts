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
    avatar: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: `assets/as_avatar/defaultavatar.png`
    },
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
    idprovince: DataTypes.STRING,
    idterritoire: DataTypes.STRING,
    idvillage: DataTypes.STRING,
    hectare_cultive: DataTypes.STRING,
    isvalidated: DataTypes.INTEGER,
    uuid: DataTypes.STRING,
    password: DataTypes.STRING

}, {
    paranoid: true,
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['phone', 'email']
        }
    ]
});
