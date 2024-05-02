import { Commandes } from "../__models/model.commandes";
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { NextFunction, Request, Response } from "express";
import { Produits } from "../__models/model.produits";
import { Typelivraisons } from "../__models/model.typelivraison";
import { Sequelize } from "sequelize";
import { log } from "console";
import { Unites } from "../__models/model.unitemesures";
import { Users } from "../__models/model.users";
import { groupedDataByColumn } from "../__helpers/helper.all";

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
            Commandes.belongsTo(Unites, { foreignKey: "id_unity" })
            Commandes.belongsTo(Users, { foreignKey: "createdby" })

            Commandes.findAll({
                include: [
                    {
                        model: Produits,
                        required: true,
                    },
                    {
                        model: Users,
                        required: true,
                        attributes: ['id', 'nom', 'postnom', 'prenom', 'phone', 'email', 'sexe']
                    },
                    {
                        model: Unites,
                        required: true,
                    },
                    {
                        model: Typelivraisons,
                        required: true,
                    }
                ],
                where: {
                    id_cooperative: idtransaction
                }
            })
                .then(commandes => {
                    const groupes = groupedDataByColumn({ column: "transaction", data: commandes })
                    return Responder(res, HttpStatusCode.Ok, { count: commandes.length, rows: commandes, groupes })
                })
                .catch(err => {
                    return Responder(res, HttpStatusCode.InternalServerError, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    listcommandebycooperativeandstate: async (req: Request, res: Response) => {
        const { currentuser } = req as any;
        const { idcooperative: idtransaction, state } = req.params
        const { __id, roles, uuid } = currentuser;
        try {
            Commandes.belongsTo(Produits, { foreignKey: "id_produit" })
            Commandes.belongsTo(Typelivraisons, { foreignKey: "type_livraison" })
            Commandes.belongsTo(Unites, { foreignKey: "id_unity" })
            Commandes.belongsTo(Users, { foreignKey: "createdby" })

            Commandes.findAll({
                include: [
                    {
                        model: Produits,
                        required: true,
                    },
                    {
                        model: Users,
                        required: true,
                        attributes: ['id', 'nom', 'postnom', 'prenom', 'phone', 'email', 'sexe']
                    },
                    {
                        model: Unites,
                        required: true,
                    },
                    {
                        model: Typelivraisons,
                        required: true,
                    }
                ],
                where: {
                    state: parseInt(state),
                    id_cooperative: idtransaction
                }
            })
                .then(commandes => {
                    const groupes = groupedDataByColumn({ column: "transaction", data: commandes })
                    return Responder(res, HttpStatusCode.Ok, { count: commandes.length, rows: commandes, groupes })
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
    },
    changestate: async (req: Request, res: Response) => {
        const { idcommande: transaction } = req.params;
        if (!transaction) return Responder(res, HttpStatusCode.NotAcceptable, "this request must have at least idcommande in the request !")
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
                        model: Produits,
                        required: false,
                    }
                ],
                where: {
                    transaction,
                    state: 3, // 3: livrable, payed and can be livrable
                }
            })
                .then(commandes => {
                    if (commandes && commandes.length > 0) {
                        Commandes.update({
                            state: 2
                        }, {
                            where: {
                                transaction
                            }
                        })
                        return Responder(res, HttpStatusCode.Ok, commandes)
                    } else {
                        return Responder(res, HttpStatusCode.BadRequest, {})
                    }
                })
                .catch(err => {
                    return Responder(res, HttpStatusCode.InternalServerError, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}