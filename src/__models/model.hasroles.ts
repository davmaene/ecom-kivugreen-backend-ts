import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { IHasrole, IRoles, IUsers } from '__enums/enum.interfacemodels';
import { Roles } from './model.roles';
import { Users } from './model.users';

export interface Hasrole extends Model<IHasrole>, IHasrole { }

export const Hasroles = connect.define<Hasrole>('__tbl_ecom_hasroles', {
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
    TblEcomRoleId: {
        type: DataTypes.INTEGER,
        references: {
            model: Roles,
            key: 'id'
        }
    }

}, {
    paranoid: true,
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['TblEcomRoleId', 'TblEcomUserId']
        }
    ]
});
