import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { ICategorie, IPayement } from '../__enums/enum.interfacemodels';
import { now } from '../__helpers/helper.moment';

export interface Payement extends Model<IPayement>, IPayement { }

export const Paiements = connect.define<Payement>('__tbl_ecom_payements', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    status: {
        type: DataTypes.INTEGER,
        defaultValue: 0, // 0: Paiment initié 1: Paiement effectue' avec succes 2: Paiement echoué
        allowNull: true
    },
    customer_phone: DataTypes.STRING,
    realref: DataTypes.STRING,
    reference: DataTypes.STRING,
    phone: DataTypes.STRING,
    amount: DataTypes.FLOAT,
    currency: DataTypes.STRING,
    category: DataTypes.INTEGER,
    description: DataTypes.STRING,
    createdby: DataTypes.INTEGER,
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: new Date() || now({ options: {} }),
        allowNull: true
    }

}, { paranoid: true, timestamps: false, freezeTableName: true });

Paiements.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Paiements` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
