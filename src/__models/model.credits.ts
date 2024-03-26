import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { ICategorie, IConfigs, ICredits } from '../__enums/enum.interfacemodels';

export interface Credit extends Model<ICredits>, ICredits { }

export const Credits = connect.define<Credit>('__tbl_ecom_credits', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    id_cooperative: DataTypes.INTEGER,
    id_user: DataTypes.INTEGER,
    montant: DataTypes.FLOAT,
    currency: DataTypes.FLOAT,
    motif: DataTypes.FLOAT,
    periode_remboursement: {
        type: DataTypes.FLOAT,
        
    }

}, { paranoid: true, timestamps: false, freezeTableName: true });

Credits.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Credits` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
