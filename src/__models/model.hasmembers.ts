import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { IHasmember, IHasrole, IRoles, IUsers } from '__enums/enum.interfacemodels';
import { Roles } from './model.roles';
import { Users } from './model.users';

export interface Hasmember extends Model<IHasmember>, IHasmember { }

export const Hasmembers = connect.define<Hasmember>('__tbl_ecom_hasmembers', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    TblEcomUserId: {
        type: DataTypes.INTEGER,
        references: {
            model: Users,
            key: 'id'
        }
    },
    TblEcomCooperativeId: {
        type: DataTypes.INTEGER,
        references: {
            model: Roles,
            key: 'id'
        }
    }

}, {
    paranoid: false,
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['TblEcomCooperativeId', 'TblEcomUserId']
        }
    ]
});

Hasmembers.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Hasmembers` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
