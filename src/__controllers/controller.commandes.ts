import { Commandes } from "../__models/model.commandes";
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { NextFunction, Request, Response } from "express";
import { Produits } from "../__models/model.produits";
import { Typelivraisons } from "../__models/model.typelivraison";
import { Sequelize } from "sequelize";
import { log } from "console";

export const __controllerCommandes = {

    listcommandebytransaction: async (req: Request, res: Response) => {
        const { currentuser } = req as any;
        const { idtransaction } = req.params
        const { __id, roles, uuid } = currentuser;
        try {
            Commandes.belongsTo(Produits, { foreignKey: "id_produit" })
            Commandes.belongsTo(Typelivraisons, { foreignKey: "type_livraison" })
            Commandes.findAll({
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
                    transaction: idtransaction
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
    listcommandebycooperative: async (req: Request, res: Response) => {
        const { currentuser } = req as any;
        const { idcooperative: idtransaction } = req.params
        const { __id, roles, uuid } = currentuser;
        try {
            Commandes.belongsTo(Produits, { foreignKey: "id_produit" })
            Commandes.belongsTo(Typelivraisons, { foreignKey: "type_livraison" })
            Commandes.findAll({
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
                    transaction: idtransaction
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
    listtransaction: async (req: Request, res: Response) => {
        const { currentuser } = req as any;
        const { __id, roles, uuid } = currentuser;
        try {
            Commandes.findAll({
                attributes: [
                    [Sequelize.fn('LEFT', Sequelize.col('transaction'), 30), 'transaction'],
                ],
                group: ['transaction'],
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
    list: async (req: Request, res: Response) => {
        try {
            Commandes.belongsTo(Produits, { foreignKey: "id_produit" })
            Commandes.belongsTo(Typelivraisons, { foreignKey: "type_livraison" })
            Commandes.findAll({
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
                where: {}
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
                    log(err)
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
    },
    validate: async (req: Request, res: Response) => {
        const { idcommande } = req.params;
        if (!idcommande) return Responder(res, HttpStatusCode.NotAcceptable, "this request must have at least idcommande in the request !")
        return Responder(res, HttpStatusCode.Ok, "This --- endpoint is under construction ---- 😃")
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