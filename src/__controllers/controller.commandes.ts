import { Commandes } from "../__models/model.commandes";
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { NextFunction, Request, Response } from "express";
import { Produits } from "../__models/model.produits";

export const __controllerCommandes = {
    list: async (req: Request, res: Response) => {
        try {
            Commandes.belongsTo(Produits, { foreignKey: "id_produit" })
            Commandes.findAll({
                include: [
                    {
                        model: Produits,
                        required: false,
                    }
                ],
                where: {

                }
            })
                .then(commandes => {
                    return Responder(res, HttpStatusCode.Ok, { count: commandes.length, rows: commandes })
                })
                .catch(err => {
                    return Responder(res, HttpStatusCode.InternalServerError, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    listbyowner: async (req: Request, res: Response) => {
        const { currentuser } = req as any;
        const { __id, roles, uuid } = currentuser;

        try {
            Commandes.belongsTo(Produits, { foreignKey: "id_produit" })
            Commandes.findAll({
                include: [
                    {
                        model: Produits,
                        required: false,
                    }
                ],
                where: {
                    createdby: __id
                }
            })
                .then(commandes => {
                    return Responder(res, HttpStatusCode.Ok, { count: commandes.length, rows: commandes })
                })
                .catch(err => {
                    return Responder(res, HttpStatusCode.InternalServerError, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    listbystate: async (req: Request, res: Response) => {
        const { status } = req.params;
        if (!status) return Responder(res, HttpStatusCode.NotAcceptable, "this request must have at least status in the request !")
        try {
            Commandes.belongsTo(Produits, { foreignKey: "id_produit" })
            Commandes.findAll({
                include: [
                    {
                        model: Produits,
                        required: false,
                    }
                ],
                where: {
                    state: parseInt(status)
                }
            })
                .then(commandes => {
                    return Responder(res, HttpStatusCode.Ok, { count: commandes.length, rows: commandes })
                })
                .catch(err => {
                    return Responder(res, HttpStatusCode.InternalServerError, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}