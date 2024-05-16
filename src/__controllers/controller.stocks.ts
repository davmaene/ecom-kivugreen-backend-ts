import { randomLongNumber } from './../__helpers/helper.random';
import { Stocks } from "../__models/model.stocks";
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { Response, Request, NextFunction } from "express";
import { Produits } from '../__models/model.produits';
import { Console, log } from 'console';
import { Cooperatives } from '../__models/model.cooperatives';
import { Hasproducts } from '../__models/model.hasproducts';
import { connect } from '../__databases/connecte';
import { Configs } from '../__models/model.configs';
import { Categories } from '../__models/model.categories';
import { Unites } from '../__models/model.unitemesures';
import { Commandes } from '../__models/model.commandes';
import { Typelivraisons } from '../__models/model.typelivraison';
import { supprimerDoublons } from '../__helpers/helper.all';
import { Historiquesmembersstocks } from '../__models/model.histories';

export const __controllerStocks = {
    history: async (req: Request, res: Response, next: NextFunction) => {
        const { currentuser } = req as any;
        const { __id, roles, uuid, phone } = currentuser;
        const { idstock } = req.params;
        if (!idstock) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least stockid")
        try {
            Stocks.belongsTo(Cooperatives, { foreignKey: "id_cooperative" })
            Stocks.belongsToMany(Produits, { through: Hasproducts, })// as: 'produits'

            Stocks.findOne({
                where: {
                    id: idstock
                },
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
                .then(async stck => {
                    if (stck instanceof Stocks) {
                        const __mouvements: any[] = []
                        const { __tbl_ecom_cooperative, __tbl_ecom_produits, date_expiration, date_production, createdby, description, id_cooperative, transaction, createdAt, id, updatedAt } = stck.toJSON() as any
                        for (let index = 0; index < __tbl_ecom_produits.length; index++) {
                            const { id: asproduct, __tbl_ecom_hasproducts } = __tbl_ecom_produits[index];
                            const { id: ashasproduct, id_membre, qte, prix_unitaire, prix_plus_commission, currency } = __tbl_ecom_hasproducts
                            // ============================================
                            Commandes.belongsTo(Produits, { foreignKey: "id_produit" })
                            Commandes.belongsTo(Typelivraisons, { foreignKey: "type_livraison" })
                            const cmmds = await Commandes.findAll({
                                include: [
                                    {
                                        model: Produits,
                                        required: false,
                                    },
                                    {
                                        model: Typelivraisons,
                                        required: false,
                                    }
                                ],
                                where: {
                                    id_produit: ashasproduct
                                }
                            })
                            __mouvements.push({
                                ...__tbl_ecom_produits,
                                mouvements: {
                                    ...__tbl_ecom_hasproducts,

                                }
                            })
                        }
                        return Responder(res, HttpStatusCode.Ok, { ...stck.toJSON(), mouvements: __mouvements })
                    } else {
                        log(stck)
                        return Responder(res, HttpStatusCode.InternalServerError, stck)
                    }
                })
                .catch(er => {
                    log(er)
                    return Responder(res, HttpStatusCode.InternalServerError, er)
                })

        } catch (error) {
            log(error)
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    in: async (req: Request, res: Response) => {
        const { id_cooperative, items, description, date_production, date_expiration } = req.body;
        const { currentuser } = req as any;
        if (!id_cooperative || !items) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least !id_cooperative || !items")
        if (!Array.isArray(items) || Array.from(items).length === 0) return Responder(res, HttpStatusCode.NotAcceptable, "Items must be a type of Array")
        const array: any[] = Array.from(items);
        const { __id, roles, uuid, phone } = currentuser;
        const configs = await Configs.findOne({
            where: {
                id: 1
            }
        })

        console.log('====================================');
        console.log(array);
        console.log('====================================');

        try {
            const transaction = await connect.transaction()
            Stocks.create({
                date_expiration,
                date_production,
                createdby: __id,
                id_cooperative: id_cooperative,
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
                                const { id_produit, qte, prix_unitaire, currency, date_production: asdate_production, id_member, qte_critique }: any = array[index];
                                if (!id_produit || !qte || !prix_unitaire || !currency || !asdate_production || !id_member) { // || !id_membre
                                    nottreated.push(array[index])
                                } else {
                                    try {
                                        const prd = await Produits.findOne({
                                            attributes: ['id', 'produit', 'id_unity', 'id_category', 'id_souscategory', 'image', 'tva'],
                                            where: {
                                                id: id_produit
                                            }
                                        })
                                        if (prd instanceof Produits) {
                                            const { id, produit, id_unity, id_category, id_souscategory, image, tva } = prd.toJSON() as any
                                            const { id: asstockid } = stock.toJSON() as any;
                                            if (produit && id_category && id_unity) {
                                                const [item, created] = await Hasproducts.findOrCreate({
                                                    where: {
                                                        TblEcomProduitId: id_produit,
                                                        TblEcomCooperativeId: id_cooperative
                                                    },
                                                    defaults: {
                                                        prix_plus_commission: prix_unitaire + (prix_unitaire * parseFloat(commission_price)) + (prix_unitaire * parseFloat(tva)),
                                                        currency,
                                                        tva,
                                                        qte_critique: qte_critique || 0,
                                                        prix_unitaire,
                                                        date_production: asdate_production,
                                                        TblEcomCategoryId: id_category,
                                                        TblEcomCooperativeId: id_cooperative,
                                                        TblEcomProduitId: id_produit,
                                                        TblEcomStockId: asstockid || 0,
                                                        TblEcomUnitesmesureId: id_unity,
                                                        qte,
                                                        id_membre: [id_member || 0]
                                                    },
                                                    transaction
                                                })
                                                if (created) {
                                                    Historiquesmembersstocks.create({
                                                        TblEcomUserId: id_member,
                                                        qte,
                                                        date_production: asdate_production,
                                                        TblEcomCategoryId: id_category,
                                                        TblEcomCooperativeId: id_cooperative,
                                                        TblEcomProduitId: id_produit,
                                                        TblEcomStockId: asstockid || 0,
                                                        TblEcomUnitesmesureId: id_unity,
                                                    }, {})
                                                    treated.push(array[index])

                                                } else {
                                                    const { qte: asqte, id_membre: asids } = item?.toJSON()
                                                    Historiquesmembersstocks.create({
                                                        TblEcomUserId: id_member,
                                                        qte,
                                                        date_production: asdate_production,
                                                        TblEcomCategoryId: id_category,
                                                        TblEcomCooperativeId: id_cooperative,
                                                        TblEcomProduitId: id_produit,
                                                        TblEcomStockId: asstockid || 0,
                                                        TblEcomUnitesmesureId: id_unity,
                                                    }, {})
                                                    const __ = !Array.isArray(asids) ? [asids] : asids
                                                    item.update({
                                                        id_membre: [...supprimerDoublons({ tableau: [...__ as any] })],
                                                        qte: qte + asqte
                                                    })
                                                    treated.push({ ...array[index], produit })
                                                }
                                            } else {
                                                log("We can not save this item cause it can not be proceced !", id_produit)
                                            }
                                        } else {
                                            nottreated.push(array[index])
                                        }
                                    } catch (error) {
                                        nottreated.push(array[index])
                                        // log(error)
                                        console.log('====================================');
                                        console.log(id_produit, prix_unitaire, commission_price, " ============> ", id_member);
                                        console.log('====================================');
                                        log("Error on treatement on object => ", id_produit, configs, error)
                                    }
                                }
                            }

                            if (treated.length > 0) {
                                transaction.commit()
                                return Responder(res, HttpStatusCode.Ok, { ...stock.toJSON(), produits: treated })
                            } else {
                                transaction.rollback()
                                return Responder(res, HttpStatusCode.Conflict, "this request must have at least Configurations params for the price !, the table of product is empty")
                            }
                        } else {
                            return Responder(res, HttpStatusCode.Conflict, "this request must have at least Configurations params for the price !, we can not initialize the commission and taux table")
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
    list: async (req: Request, res: Response) => {
        try {
            Stocks.belongsTo(Cooperatives, { foreignKey: "id_cooperative" })
            Stocks.belongsToMany(Produits, { through: Hasproducts, })// as: 'produits'

            Stocks.findAll({
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
                .then(async (rows) => {
                    const __: any[] = []
                    for (let index = 0; index < rows.length; index++) {
                        let items: any[] = []
                        const { __tbl_ecom_produits } = rows[index].toJSON() as any;
                        for (let index = 0; index < __tbl_ecom_produits.length; index++) {
                            const { id, produit, __tbl_ecom_hasproducts } = __tbl_ecom_produits[index] as any;
                            const { TblEcomProduitId, TblEcomCategoryId, TblEcomUnitesmesureId } = __tbl_ecom_hasproducts;

                            const cat = await Categories.findOne({
                                // raw: true,
                                where: {
                                    id: TblEcomCategoryId
                                }
                            })
                            const uni = await Unites.findOne({
                                // raw: true,
                                where: {
                                    id: TblEcomUnitesmesureId
                                }
                            })
                            items.push({
                                ...__tbl_ecom_produits[index],
                                __tbl_ecom_categories: cat?.toJSON(),
                                __tbl_ecom_unitesmesures: uni?.toJSON()
                            })
                        }
                        __.push({
                            ...rows[index].toJSON() as any,
                            __tbl_ecom_produits: [...items]
                        })
                    }
                    return Responder(res, HttpStatusCode.Ok, { count: rows.length, rows: __ })
                })
                .catch(error => {
                    return Responder(res, HttpStatusCode.Conflict, error)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    getonebycoopec: async (req: Request, res: Response) => {
        const { idcooperative } = req.params;
        if (!idcooperative) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least idcooperative")
        try {
            Stocks.belongsTo(Cooperatives, { foreignKey: "id_cooperative" })
            Stocks.belongsToMany(Produits, { through: Hasproducts })// as: 'produits'
            Stocks.findAll({
                order: [
                    ['id', 'DESC'],
                ],
                // limit: 1,
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
                        where: {
                            id: parseInt(idcooperative)
                        },
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'email', 'sigle', 'cooperative', 'description']
                    }
                ]
            })
                .then(async (rows) => {
                    const __: any[] = []
                    for (let index = 0; index < rows.length; index++) {
                        let items: any[] = []
                        const { __tbl_ecom_produits } = rows[index].toJSON() as any;
                        for (let index = 0; index < __tbl_ecom_produits.length; index++) {
                            const { id, produit, __tbl_ecom_hasproducts } = __tbl_ecom_produits[index] as any;
                            const { TblEcomProduitId, TblEcomCategoryId, TblEcomUnitesmesureId } = __tbl_ecom_hasproducts;

                            const cat = await Categories.findOne({
                                // raw: true,
                                where: {
                                    id: TblEcomCategoryId
                                }
                            })
                            const uni = await Unites.findOne({
                                // raw: true,
                                where: {
                                    id: TblEcomUnitesmesureId
                                }
                            })
                            items.push({
                                ...__tbl_ecom_produits[index],
                                __tbl_ecom_categories: cat?.toJSON(),
                                __tbl_ecom_unitesmesures: uni?.toJSON()
                            })
                        }
                        __.push({
                            ...rows[index].toJSON() as any,
                            __tbl_ecom_produits: [...items]
                        })
                    }
                    return Responder(res, HttpStatusCode.Ok, { count: rows.length, rows: __ })
                })
                .catch(error => {
                    log(error)
                    return Responder(res, HttpStatusCode.Conflict, error)
                })
        } catch (error) {
            log(error)
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    getonebyid: async (req: Request, res: Response) => {
        const { idstock } = req.params;
        if (!idstock) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least idstock")
        try {
            Stocks.belongsTo(Cooperatives, { foreignKey: "id_cooperative" })
            Stocks.belongsToMany(Produits, { through: Hasproducts, })// as: 'produits'
            Stocks.findAll({
                where: {
                    id: idstock
                },
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
                        // where: {
                        //     id: idcooperative
                        // },
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'email', 'sigle', 'cooperative', 'description']
                    }
                ]
            })
                .then(async (rows) => {
                    const __: any[] = []
                    for (let index = 0; index < rows.length; index++) {
                        let items: any[] = []
                        const { __tbl_ecom_produits } = rows[index].toJSON() as any;
                        for (let index = 0; index < __tbl_ecom_produits.length; index++) {
                            const { id, produit, __tbl_ecom_hasproducts } = __tbl_ecom_produits[index] as any;
                            const { TblEcomProduitId, TblEcomCategoryId, TblEcomUnitesmesureId } = __tbl_ecom_hasproducts;

                            const cat = await Categories.findOne({
                                // raw: true,
                                where: {
                                    id: TblEcomCategoryId
                                }
                            })
                            const uni = await Unites.findOne({
                                // raw: true,
                                where: {
                                    id: TblEcomUnitesmesureId
                                }
                            })
                            items.push({
                                ...__tbl_ecom_produits[index],
                                __tbl_ecom_categories: cat?.toJSON(),
                                __tbl_ecom_unitesmesures: uni?.toJSON()
                            })
                        }
                        __.push({
                            ...rows[index].toJSON() as any,
                            __tbl_ecom_produits: [...items]
                        })
                    }
                    return Responder(res, HttpStatusCode.Ok, { count: rows.length, rows: __ })
                })
                .catch(error => {
                    log(error)
                    return Responder(res, HttpStatusCode.Conflict, error)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}