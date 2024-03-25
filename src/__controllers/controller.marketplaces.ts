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

export const __controllerMarketplace = {
    placecommand: async (req: Request, res: Response, next: NextFunction) => {
        const { currentuser } = req as any;
        const { __id, roles, uuid, phone } = currentuser;
        const { items, type_livraison } = req.body;
        if (!items || !Array.isArray(items) || !type_livraison) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least items and can not be empty ! and type_livraison");

        try {
            const treated: any[] = []
            const nottreated: any[] = []

            for (let index = 0; index < Array.from(items).length; index++) {
                const { id_produit, qte } = items[index];
                Hasproducts.belongsTo(Produits) // , { foreignKey: 'TblEcomProduitId' }
                Hasproducts.belongsTo(Unites) // , { foreignKey: 'TblEcomUnitesmesureId' }
                Hasproducts.belongsTo(Stocks) // , { foreignKey: 'TblEcomStockId' }
                Hasproducts.belongsTo(Cooperatives) // , { foreignKey: 'TblEcomCooperativeId' }

                const has = await Hasproducts.findOne({
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
                        treated.push(has.toJSON())
                    } else {
                        nottreated.push({ item: has.toJSON() as any, message: `Commande received but the commanded qte is 'gt' the current store ! STORE:::${asqte} <==> QRY:::${qte}` })
                    }
                } else {
                    nottreated.push({ item: items[index] as any, message: `Item can not be found !` })
                }
            }

            if (treated.length > 0) {
                return Responder(res, HttpStatusCode.Ok, { treated, nottreated })
            } else {
                return Responder(res, HttpStatusCode.InternalServerError, "Commande can not be proceded cause the table of all commande is empty !")
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
            log(offset)

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
                    return Responder(res, HttpStatusCode.Ok, rows)
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
    }
}