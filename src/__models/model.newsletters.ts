import { DataTypes, Model } from 'sequelize'
import { connect } from '../__databases/connecte'
import { ICategorie, IConfigs, INewsletter } from '../__enums/enum.interfacemodels';
import { now } from '../__helpers/helper.moment';

export interface News extends Model<INewsletter>, INewsletter { }

export const Newsletters = connect.define<News>('__tbl_ecom_newsletters', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        unique: true
    },
    description: DataTypes.TEXT,
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: new Date() || now({ options: {} }),
        allowNull: true
    }

}, { paranoid: true, timestamps: false, freezeTableName: true });

Newsletters.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Newsletters` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
