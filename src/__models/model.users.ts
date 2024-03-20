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
    isvalidated: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    uuid: DataTypes.STRING,
    password: DataTypes.STRING

}, {
    paranoid: false,
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['phone', 'email']
        }
    ]
});

Users.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Users` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
