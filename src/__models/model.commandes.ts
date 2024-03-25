import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { ICommande } from '../__enums/enum.interfacemodels';

export interface Commande extends Model<ICommande>, ICommande { }

export const Commandes = connect.define<Commande>('__tbl_ecom_commandes', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    transaction: DataTypes.STRING,
    id_produit: DataTypes.INTEGER,
    qte: DataTypes.INTEGER,
    prix_total: DataTypes.FLOAT,
    prix_unit: DataTypes.FLOAT,
    currency: DataTypes.STRING,
    payament_phone: DataTypes.STRING,
    type_livraison: DataTypes.INTEGER,
    description: DataTypes.STRING,
    is_pending: DataTypes.INTEGER,
    state: DataTypes.INTEGER,
    createdby: DataTypes.INTEGER

}, { paranoid: true, timestamps: false, freezeTableName: true });

Commandes.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Commandes` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
