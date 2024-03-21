import { randomLongNumber } from './../__helpers/helper.random';
import { Stocks } from "../__models/model.stocks";
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { Response, Request } from "express";
import { Produits } from '../__models/model.produits';
import { log } from 'console';
import { Cooperatives } from '../__models/model.cooperatives';
import { Hasproducts } from '../__models/model.hasproducts';
import { connect } from '../__databases/connecte';
import { Configs } from '../__models/model.configs';

export const __controllerStocks = {
    in: async (req: Request, res: Response) => {
        const { id_ccoperative, items, description } = req.body;
        const { currentuser } = req as any;
        if (!id_ccoperative || !items) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least !id_ccoperative || !items")
        if (!Array.isArray(items) || Array.from(items).length === 0) return Responder(res, HttpStatusCode.NotAcceptable, "Items must be a type of Array")
        const array: any[] = Array.from(items);
        const { __id, roles, uuid, phone } = currentuser;
        const configs = await Configs.findOne({
            raw: true,
            where: {
                id: 1
            }
        })

        try {
            const transaction = await connect.transaction()
            Stocks.create({
                date_expiration: '',
                date_production: '',
                createdby: __id,
                id_cooperative: id_ccoperative,
                transaction: randomLongNumber({ length: 15 }),
                description
            }, { transaction })
                .then(async stock => {
                    if (stock instanceof Stocks) {
                        const treated: any[] = []
                        const nottreated: any[] = []
                        if (configs instanceof Configs) {
                            const { taux_change, commission_price } = configs.toJSON() as any;
                            for (let index = 0; index < array.length; index++) {
                                const { id_produit, qte, prix_unitaire, currency }: any = array[index];
                                try {
                                    const prd = await Produits.findOne({
                                        attributes: ['id', 'produit', 'id_unity', 'id_category', 'id_souscategory', 'image'],
                                        where: {
                                            id: id_produit
                                        }
                                    })
                                    if (prd instanceof Produits) {
                                        const { id, produit, id_unity, id_category, id_souscategory, image } = prd.toJSON() as any
                                        const { id: asstockid } = stock.toJSON()
                                        if (produit && id_category && id_souscategory && id_unity) {
                                            const [item, created] = await Hasproducts.findOrCreate({
                                                where: {
                                                    TblEcomProduitId: id_produit,
                                                    TblEcomCooperativeId: id_ccoperative
                                                },
                                                defaults: {
                                                    prix_plus_commission: prix_unitaire + (prix_unitaire * parseFloat(commission_price)),
                                                    currency,
                                                    prix_unitaire,
                                                    TblEcomCategorieId: id_category,
                                                    TblEcomCooperativeId: id_ccoperative,
                                                    TblEcomProduitId: id_produit,
                                                    TblEcomStockId: asstockid || 0,
                                                    TblEcomUnitesmesureId: id_unity,
                                                    qte
                                                },
                                                transaction
                                            })
                                            if (created) {
                                                nottreated.push(array[index])
                                            } else {
                                                const { qte: asqte } = item.toJSON()
                                                item.update({
                                                    qte: qte + asqte
                                                })
                                                treated.push(array[index])
                                            }
                                        }
                                    } else {
                                        nottreated.push(array[index])
                                    }
                                } catch (error) {
                                    nottreated.push(array[index])
                                    log("Error on treatement on object => ", id_produit)
                                }
                            }

                            transaction.commit()
                            return Responder(res, HttpStatusCode.Ok, stock)
                        } else {
                            return Responder(res, HttpStatusCode.Conflict, "this request must hava at least Configurations params for the price !")
                        }
                    } else {
                        transaction.rollback()
                        return Responder(res, HttpStatusCode.Conflict, {})
                    }
                })
                .catch(err => {
                    transaction.rollback()
                    return Responder(res, HttpStatusCode.Conflict, err)
                })

        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    list: (req: Request, res: Response) => {
        try {
            Stocks.belongsTo(Cooperatives, { foreignKey: "id_cooperative" })
            Stocks.belongsToMany(Produits, { through: Hasproducts, })// as: 'produits'
            Stocks.findAndCountAll({
                where: {},
                include: [
                    {
                        model: Produits,
                        // as: 'produits',
                        required: true,
                        attributes: ['id', 'produit']
                    },
                    {
                        model: Cooperatives,
                        required: true,
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'email', 'sigle', 'cooperative', 'description']
                    }
                ]
            })
                .then(({ count, rows }) => Responder(res, HttpStatusCode.Ok, { count, rows }))
                .catch(error => {
                    log(error)
                    return Responder(res, HttpStatusCode.Conflict, error)
                })
        } catch (error) {
            log(error)
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}