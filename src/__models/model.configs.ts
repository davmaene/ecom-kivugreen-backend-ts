import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { ICategorie, IConfigs } from '../__enums/enum.interfacemodels';

export interface Config extends Model<IConfigs>, IConfigs { }

export const Configs = connect.define<Config>('__tbl_ecom_configs', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    taux_change: DataTypes.FLOAT,
    commission_price: DataTypes.STRING

}, { paranoid: true, timestamps: false, freezeTableName: true });

Configs.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Configs` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
