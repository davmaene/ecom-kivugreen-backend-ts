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
                logging: false,
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
    }
}