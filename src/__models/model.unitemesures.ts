import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { ICategorie, IProvinces, IRoles, IUnite, IUsers } from '../__enums/enum.interfacemodels';

export interface Unity extends Model<IUnite>, IUnite { }

export const Unites = connect.define<Unity>('__tbl_ecom_unitesmesures', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    unity: DataTypes.STRING,
    description: DataTypes.STRING,
    equival_kgs: DataTypes.FLOAT

}, { paranoid: true, timestamps: false, freezeTableName: true });

Unites.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Unites` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
