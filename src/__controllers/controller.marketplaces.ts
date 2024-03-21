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
        const { qte, id_produit } = req.body
        const { currentuser } = req as any;
        const { __id, roles, uuid, phone } = currentuser;
        if (!qte || !id_produit) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least id_produit and qte !")
        try {
            Hasproducts.belongsTo(Produits) // , { foreignKey: 'TblEcomProduitId' }
            Hasproducts.belongsTo(Unites) // , { foreignKey: 'TblEcomUnitesmesureId' }
            Hasproducts.belongsTo(Stocks) // , { foreignKey: 'TblEcomStockId' }
            Hasproducts.belongsTo(Cooperatives) // , { foreignKey: 'TblEcomCooperativeId' }
            Hasproducts.findOne({
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
                .then(has => {
                    if (has instanceof Hasproducts) {
                        const { id, qte: asqte, prix_unitaire, currency, __tbl_ecom_produit, __tbl_ecom_unitesmesure, __tbl_ecom_stock, __tbl_ecom_cooperative } = has.toJSON() as any
                        if (qte <= asqte) {
                            return Responder(res, HttpStatusCode.NotAcceptable, has)
                        } else {
                            return Responder(res, HttpStatusCode.NotAcceptable, `Commande received but the commanded qte is 'gt' the current store ! STORE:::${asqte} <==> QRY:::${qte}`)
                        }
                    } else {
                        return Responder(res, HttpStatusCode.NotFound, has)
                    }
                })
                .catch(err => {
                    return Responder(res, HttpStatusCode.Conflict, err)
                })
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
    }
}