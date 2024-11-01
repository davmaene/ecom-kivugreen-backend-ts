import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { ICategorie, IConfigs, ICredits } from '../__enums/enum.interfacemodels';
import { now } from '../__helpers/helper.moment';

export interface Credit extends Model<ICredits>, ICredits { }

export const Credits = connect.define<Credit>('__tbl_ecom_credits', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    id_cooperative: DataTypes.INTEGER,
    createdat: DataTypes.DATE,
    id_user: DataTypes.INTEGER,
    montant: DataTypes.FLOAT,
    currency: DataTypes.STRING,
    motif: DataTypes.STRING,
    validated_by_bank: {
        defaultValue: 0,
        type: DataTypes.INTEGER,
    },
    status: {
        type: DataTypes.INTEGER, // 1: validated 0: otherwise
        allowNull: true,
        defaultValue: 0
    },
    periode_remboursement: {
        type: DataTypes.FLOAT, // in month
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: new Date() || now({ options: {} }),
        allowNull: true
    }

}, { paranoid: true, timestamps: false, freezeTableName: true });

Credits.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Credits` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
