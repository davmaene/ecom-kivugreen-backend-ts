import { randomLongNumber } from './../__helpers/helper.random';
import { Hasproducts } from "../__models/model.hasproducts";
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { NextFunction, Request, Response } from "express";
import { Op } from "sequelize";
import { Produits } from "../__models/model.produits";
import { log } from "console";
import { Unites } from "../__models/model.unitemesures";
import { Stocks } from "../__models/model.stocks";
import { Cooperatives } from "../__models/model.cooperatives";
import { Commandes } from '../__models/model.commandes';
import { Users } from '../__models/model.users';
import { Services } from '../__services/serives.all';
import { fillphone } from '../__helpers/helper.fillphone';
import { connect } from '../__databases/connecte';

export const __controllerMarketplace = {
    placecommand: async (req: Request, res: Response, next: NextFunction) => {
        const { currentuser } = req as any;
        const { __id, roles, uuid } = currentuser;
        const { items, type_livraison, payament_phone, currency_payement } = req.body;
        if (!items || !Array.isArray(items) || !type_livraison) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least items and can not be empty ! and type_livraison");

        try {
            const treated: any[] = []
            const c_treated: any[] = []
            const c_nottreated: any[] = []
            const nottreated: any[] = []
            const transaction = randomLongNumber({ length: 13 })
            const tr_ = await connect.transaction()
            const currentUser = await Users.findOne({
                where: {
                    id: __id
                }
            })

            if (currentUser instanceof Users) {
                const { phone, email, nom } = currentUser.toJSON() as any;
                for (let index = 0; index < Array.from(items).length; index++) {
                    const { id_produit, qte } = items[index];

                    Hasproducts.belongsTo(Produits) // , { foreignKey: 'TblEcomProduitId' }
                    Hasproducts.belongsTo(Unites) // , { foreignKey: 'TblEcomUnitesmesureId' }
                    Hasproducts.belongsTo(Stocks) // , { foreignKey: 'TblEcomStockId' }
                    Hasproducts.belongsTo(Cooperatives) // , { foreignKey: 'TblEcomCooperativeId' }

                    const has = await Hasproducts.findOne({
                        transaction: tr_,
                        include: [
                            {
                                model: Produits,
                                required: true,
                                attributes: ['id', 'produit', 'image', 'description']
                            },
                            {
                                model: Unites,
                                required: true,
                                attributes: ['id', 'unity', 'equival_kgs']
                            },
                            {
                                model: Stocks,
                                required: true,
                                attributes: ['id', 'transaction']
                            },
                            {
                                model: Cooperatives,
                                required: true,
                                attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'cooperative', 'sigle']
                            }
                        ],
                        where: {
                            id: id_produit
                        }
                    })

                    if (has instanceof Hasproducts) {
                        const { id, qte: asqte, prix_unitaire, currency, __tbl_ecom_produit, __tbl_ecom_unitesmesure, __tbl_ecom_stock, __tbl_ecom_cooperative } = has.toJSON() as any
                        if (qte <= asqte) {
                            treated.push({ ...has.toJSON(), qte })
                        } else {
                            nottreated.push({ item: has.toJSON() as any, message: `Commande received but the commanded qte is 'gt' the current store ! STORE:::${asqte} <==> QRY:::${qte}` })
                        }
                    } else {
                        nottreated.push({ item: items[index] as any, message: `Item can not be found !` })
                    }
                }

                if (treated.length > 0) {
                    const somme: number[] = []
                    for (let index = 0; index < treated.length; index++) {
                        const { id, qte, prix_unitaire, currency, __tbl_ecom_cooperative, __tbl_ecom_stock, __tbl_ecom_unitesmesure, __tbl_ecom_produit }: any = treated[index] as any;
                        const { produit } = __tbl_ecom_produit
                        const { unity } = __tbl_ecom_unitesmesure
                        let price: number = parseFloat(prix_unitaire) * parseFloat(qte)
                        let { code, data, message } = await Services.converterDevise({ amount: price, currency: currency_payement || currency });
                        if (code === 200) {
                            const { amount: converted_price, currency: converted_currency } = data
                            somme.push(converted_price)
                            const cmmd = await Commandes.create({
                                id_produit: id,
                                is_pending: 1,
                                payament_phone: payament_phone || phone,
                                currency: converted_currency,
                                prix_total: converted_price,
                                prix_unit: prix_unitaire,
                                qte,
                                state: 0,
                                transaction,
                                type_livraison,
                                createdby: __id
                            }, { transaction: tr_ })
                            if (cmmd instanceof Commandes) {
                                Services.onSendSMS({
                                    is_flash: true,
                                    to: fillphone({ phone }),
                                    content: `Bonjour ${nom} nous avons reçu votre commande de (${qte}${unity}) de ${produit}, un push message vous sera envoyé veuillez acceptez le paiement sur votre téléphone, montant à payer ${converted_price}${converted_currency}, transID: ${transaction}`
                                })
                                    .then(sms => { })
                                    .catch((err: any) => { })
                                c_treated.push(cmmd)
                            } else {
                                // tr_.rollback()
                                c_nottreated.push(cmmd)
                            }
                        } else {
                            // tr_.rollback()
                        }
                    }
                    tr_.commit()
                    return Responder(res, HttpStatusCode.Ok, { c_treated, c_nottreated })
                } else {
                    tr_.rollback()
                    return Responder(res, HttpStatusCode.InternalServerError, "Commande can not be proceded cause the table of all commande is empty !")
                }
            } else {
                tr_.rollback()
                return Responder(res, HttpStatusCode.InternalServerError, `User can not be found in ---USER:${__id} `)
            }

        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    marketplace: async (req: Request, res: Response, next: NextFunction) => {
        let { page_size, page_number } = req.query as any;
        page_number = page_number ? parseInt(page_number) : 0
        page_size = page_size ? parseInt(page_size) : 100
        try {

            Hasproducts.belongsTo(Produits) // , { foreignKey: 'TblEcomProduitId' }
            Hasproducts.belongsTo(Unites) // , { foreignKey: 'TblEcomUnitesmesureId' }
            Hasproducts.belongsTo(Stocks) // , { foreignKey: 'TblEcomStockId' }
            Hasproducts.belongsTo(Cooperatives) // , { foreignKey: 'TblEcomCooperativeId' }

            const offset = ((page_number) - 1) * (page_size);

            Hasproducts.findAll({
                // attributes: ['id', 'qte', 'currency'],
                offset: (offset),
                limit: (page_size),
                include: [
                    {
                        model: Produits,
                        required: true,
                        attributes: ['id', 'produit', 'image', 'description']
                    },
                    {
                        model: Unites,
                        required: true,
                        attributes: ['id', 'unity', 'equival_kgs']
                    },
                    {
                        model: Stocks,
                        required: true,
                        attributes: ['id', 'transaction']
                    },
                    {
                        model: Cooperatives,
                        required: true,
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'cooperative', 'sigle']
                    }
                ],
                where: {
                    qte: { [Op.gte]: 0 }
                }
            })
                .then((rows) => {
                    return Responder(res, HttpStatusCode.Ok, { count: rows.length, list: rows })
                })
                .catch(err => {
                    log(err)
                    return Responder(res, HttpStatusCode.Conflict, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    addtopanier: async (req: Request, res: Response) => {
        try {

        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    deletepanier: async (req: Request, res: Response) => {
        const { idpanier } = req.body
        if (!idpanier) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least idpanier !")
        try {

        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    validatepanier: async (req: Request, res: Response) => {
        const { idpanier } = req.body
        if (!idpanier) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least idpanier !")
        try {

        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    searchbykeyword: async (req: Request, res: Response) => {
        const { keyword } = req.params
        const page_number = 1;
        const page_size = 1000;

        try {
            Hasproducts.belongsTo(Produits) // , { foreignKey: 'TblEcomProduitId' }
            Hasproducts.belongsTo(Unites) // , { foreignKey: 'TblEcomUnitesmesureId' }
            Hasproducts.belongsTo(Stocks) // , { foreignKey: 'TblEcomStockId' }
            Hasproducts.belongsTo(Cooperatives) // , { foreignKey: 'TblEcomCooperativeId' }

            const offset = ((page_number) - 1) * (page_size);

            Hasproducts.findAll({
                // attributes: ['id', 'qte', 'currency'],
                offset: (offset),
                limit: (page_size),
                include: [
                    {
                        model: Produits,
                        required: true,
                        attributes: ['id', 'produit', 'image', 'description'],
                        where: {
                            produit: {
                                [Op.like]: `%${keyword}%`
                            }
                        }
                    },
                    {
                        model: Unites,
                        required: true,
                        attributes: ['id', 'unity', 'equival_kgs']
                    },
                    {
                        model: Stocks,
                        required: true,
                        attributes: ['id', 'transaction']
                    },
                    {
                        model: Cooperatives,
                        required: true,
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'cooperative', 'sigle']
                    }
                ],
                where: {
                    qte: { [Op.gte]: 0 }
                }
            })
                .then((rows) => {
                    return Responder(res, HttpStatusCode.Ok, { count: rows.length, list: rows })
                })
                .catch(err => {
                    log(err)
                    return Responder(res, HttpStatusCode.Conflict, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    searchbycooperative: async (req: Request, res: Response) => {
        const { keyword } = req.params
        const page_number = 1;
        const page_size = 1000;

        try {
            Hasproducts.belongsTo(Produits) // , { foreignKey: 'TblEcomProduitId' }
            Hasproducts.belongsTo(Unites) // , { foreignKey: 'TblEcomUnitesmesureId' }
            Hasproducts.belongsTo(Stocks) // , { foreignKey: 'TblEcomStockId' }
            Hasproducts.belongsTo(Cooperatives) // , { foreignKey: 'TblEcomCooperativeId' }

            const offset = ((page_number) - 1) * (page_size);

            Hasproducts.findAll({
                // attributes: ['id', 'qte', 'currency'],
                offset: (offset),
                limit: (page_size),
                include: [
                    {
                        model: Produits,
                        required: true,
                        attributes: ['id', 'produit', 'image', 'description']
                    },
                    {
                        model: Unites,
                        required: true,
                        attributes: ['id', 'unity', 'equival_kgs']
                    },
                    {
                        model: Stocks,
                        required: true,
                        attributes: ['id', 'transaction']
                    },
                    {
                        model: Cooperatives,
                        required: true,
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'cooperative', 'sigle'],
                        where: {
                            id: parseInt(keyword)
                        }
                    }
                ],
                where: {
                    qte: { [Op.gte]: 0 }
                }
            })
                .then((rows) => {
                    return Responder(res, HttpStatusCode.Ok, { count: rows.length, list: rows })
                })
                .catch(err => {
                    log(err)
                    return Responder(res, HttpStatusCode.Conflict, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    searchbyprovince: async (req: Request, res: Response) => {
        const { keyword } = req.params
        const page_number = 1;
        const page_size = 1000;

        try {
            Hasproducts.belongsTo(Produits) // , { foreignKey: 'TblEcomProduitId' }
            Hasproducts.belongsTo(Unites) // , { foreignKey: 'TblEcomUnitesmesureId' }
            Hasproducts.belongsTo(Stocks) // , { foreignKey: 'TblEcomStockId' }
            Hasproducts.belongsTo(Cooperatives) // , { foreignKey: 'TblEcomCooperativeId' }

            const offset = ((page_number) - 1) * (page_size);

            Hasproducts.findAll({
                // attributes: ['id', 'qte', 'currency'],
                offset: (offset),
                limit: (page_size),
                include: [
                    {
                        model: Produits,
                        required: true,
                        attributes: ['id', 'produit', 'image', 'description', 'id_category'],
                    },
                    {
                        model: Unites,
                        required: true,
                        attributes: ['id', 'unity', 'equival_kgs']
                    },
                    {
                        model: Stocks,
                        required: true,
                        attributes: ['id', 'transaction']
                    },
                    {
                        model: Cooperatives,
                        required: true,
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'cooperative', 'sigle', 'id_province'],
                        where: {
                            id_province: parseInt(keyword)
                        }
                    }
                ],
                where: {
                    qte: { [Op.gte]: 0 }
                }
            })
                .then((rows) => {
                    return Responder(res, HttpStatusCode.Ok, { count: rows.length, list: rows })
                })
                .catch(err => {
                    log(err)
                    return Responder(res, HttpStatusCode.Conflict, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    searchbycategory: async (req: Request, res: Response) => {
        const { keyword } = req.params
        const page_number = 1;
        const page_size = 1000;

        try {
            Hasproducts.belongsTo(Produits) // , { foreignKey: 'TblEcomProduitId' }
            Hasproducts.belongsTo(Unites) // , { foreignKey: 'TblEcomUnitesmesureId' }
            Hasproducts.belongsTo(Stocks) // , { foreignKey: 'TblEcomStockId' }
            Hasproducts.belongsTo(Cooperatives) // , { foreignKey: 'TblEcomCooperativeId' }

            const offset = ((page_number) - 1) * (page_size);

            Hasproducts.findAll({
                // attributes: ['id', 'qte', 'currency'],
                offset: (offset),
                limit: (page_size),
                include: [
                    {
                        model: Produits,
                        required: true,
                        attributes: ['id', 'produit', 'image', 'description', 'id_category'],
                        where: {
                            id_category: parseInt(keyword)
                        }
                    },
                    {
                        model: Unites,
                        required: true,
                        attributes: ['id', 'unity', 'equival_kgs']
                    },
                    {
                        model: Stocks,
                        required: true,
                        attributes: ['id', 'transaction']
                    },
                    {
                        model: Cooperatives,
                        required: true,
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'cooperative', 'sigle', 'id_province'],
                    }
                ],
                where: {
                    qte: { [Op.gte]: 0 }
                }
            })
                .then((rows) => {
                    return Responder(res, HttpStatusCode.Ok, { count: rows.length, list: rows })
                })
                .catch(err => {
                    log(err)
                    return Responder(res, HttpStatusCode.Conflict, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}