import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { IHasrole, IRoles, IUsers } from '__enums/enum.interfacemodels';

export interface Hasrole extends Model<IHasrole>, IHasrole { }

export const Hasroles = connect.define<Hasrole>('__tbl_ecom_hasroles', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    TblUserId: DataTypes.INTEGER,
    TblRoleId: DataTypes.INTEGER

}, { paranoid: true, timestamps: true });
