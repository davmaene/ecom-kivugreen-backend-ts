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
    id_produit: DataTypes.INTEGER,
    qte: DataTypes.INTEGER,
    prix_achat: DataTypes.FLOAT,
    currency: DataTypes.STRING,
    payament_phone: DataTypes.STRING,
    type_livraison: DataTypes.INTEGER,
    description: DataTypes.STRING

}, { paranoid: true, timestamps: false, freezeTableName: true });

Commandes.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Commandes` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
