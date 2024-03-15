import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { IProvinces, IRoles, ITerritoires, IUsers, IVillages } from '__enums/enum.interfacemodels';

export interface Village extends Model<IVillages>, IVillages { }

export const Villages = connect.define<Village>('__tbl_ecom_villages', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    idterritoire: DataTypes.STRING,
    village: DataTypes.STRING,
    latitude: DataTypes.STRING,
    longitude: DataTypes.STRING,
    groupement: DataTypes.STRING,
    provincecode: DataTypes.STRING

}, { paranoid: true, timestamps: true });
