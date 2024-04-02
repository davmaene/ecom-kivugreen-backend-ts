import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { ICooperative, IProvinces, IRoles, ITerritoires, IUsers, IVillages } from '__enums/enum.interfacemodels';

export interface Coopec extends Model<ICooperative>, ICooperative { }

export const Cooperatives = connect.define<Coopec>('__tbl_ecom_cooperatives', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    logo: {
        type: DataTypes.STRING,
        defaultValue: "",
        allowNull: true
    },
    id_territoire: DataTypes.INTEGER,
    id_province: DataTypes.INTEGER,
    coordonnees_gps: DataTypes.STRING,
    adresse: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    num_enregistrement: DataTypes.STRING,
    file: DataTypes.STRING,
    isformel: DataTypes.INTEGER,
    sigle: DataTypes.STRING,
    cooperative: DataTypes.STRING,
    id_adjoint: DataTypes.INTEGER,
    id_responsable: DataTypes.INTEGER,
    description: DataTypes.STRING,
    id_category: DataTypes.INTEGER

}, { paranoid: true, timestamps: false, freezeTableName: true });

Cooperatives.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Cooperatives` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
