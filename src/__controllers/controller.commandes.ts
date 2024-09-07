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
import { Codelivraisons } from "../__models/model.codelivraison";
import { randomLongNumber } from "../__helpers/helper.random";
import { Services } from "../__services/serives.all";
import dotenv from 'dotenv';

dotenv.config()

export const __controllerCommandes = {

    listcommandebytransaction: async (req: Request, res: Response) => {
        const { currentuser } = req as any;
        const { idtransaction } = req.params
        const { __id, roles, uuid } = currentuser;
        try {
            Commandes.belongsTo(Produits, { foreignKey: "id_produit" })
            Commandes.belongsTo(Typelivraisons, { foreignKey: "type_livraison" })
            Commandes.findAll({
                order: [
                    ['id', 'DESC']
                ],
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
        const { idcooperative: idtransaction } = req.params
        const { currentuser } = req as any;
        const { __id, roles, uuid } = currentuser;
        try {
            Commandes.belongsTo(Produits, { foreignKey: "id_produit" })
            Commandes.belongsTo(Typelivraisons, { foreignKey: "type_livraison" })
            Commandes.belongsTo(Unites, { foreignKey: "id_unity" })
            Commandes.belongsTo(Users, { foreignKey: "createdby" })

            Commandes.findAll({
                order: [
                    ['id', 'DESC']
                ],
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
                order: [
                    ['id', 'DESC']
                ],
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
                order: [
                    ['id', 'DESC']
                ],
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
            Commandes.belongsTo(Unites, { foreignKey: "id_unity" })
            Commandes.belongsTo(Users, { foreignKey: "createdby" })
            Commandes.findAll({
                order: [
                    ['id', 'DESC']
                ],
                include: [
                    {
                        model: Produits,
                        required: true,
                    },
                    {
                        model: Typelivraisons,
                        required: true,
                    },
                    {
                        model: Unites,
                        required: true,
                    },
                    {
                        model: Users,
                        required: true,
                    }
                ],
                where: {}
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
    listbyowner: async (req: Request, res: Response) => {
        const { currentuser } = req as any;
        const { __id, roles, uuid } = currentuser;

        try {
            Commandes.belongsTo(Produits, { foreignKey: "id_produit" })
            Commandes.belongsTo(Typelivraisons, { foreignKey: "type_livraison" })
            Commandes.belongsTo(Unites, { foreignKey: "id_unity" })
            Commandes.belongsTo(Users, { foreignKey: "createdby" })
            Commandes.findAll({
                order: [
                    ['id', 'DESC']
                ],
                include: [
                    {
                        model: Produits,
                        required: true,
                    },
                    {
                        model: Typelivraisons,
                        required: true,
                    },
                    {
                        model: Unites,
                        required: true,
                    },
                    {
                        model: Users,
                        required: true,
                    }
                ],
                where: {
                    createdby: __id
                }
            })
                .then(commandes => {
                    const groupes = groupedDataByColumn({ column: "transaction", data: commandes })
                    return Responder(res, HttpStatusCode.Ok, { count: commandes.length, rows: commandes, groupes })
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
            Commandes.belongsTo(Typelivraisons, { foreignKey: "type_livraison" })
            Commandes.belongsTo(Unites, { foreignKey: "id_unity" })
            Commandes.belongsTo(Users, { foreignKey: "createdby" })
            Commandes.findAll({
                order: [
                    ['id', 'DESC']
                ],
                include: [
                    {
                        model: Produits,
                        required: true,
                    },
                    {
                        model: Typelivraisons,
                        required: true,
                    },
                    {
                        model: Unites,
                        required: true,
                    },
                    {
                        model: Users,
                        required: true,
                    }
                ],
                where: {
                    state: parseInt(status)
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
    listbystateanddeliver: async (req: Request, res: Response) => {
        const { status } = req.params;
        const { currentuser } = req as any;
        const { __id, roles, uuid } = currentuser;
        if (!status) return Responder(res, HttpStatusCode.NotAcceptable, "this request must have at least status in the request !")
        log("=================> ", __id, status)
        try {
            Commandes.belongsTo(Produits, { foreignKey: "id_produit" })
            Commandes.belongsTo(Typelivraisons, { foreignKey: "type_livraison" })
            Commandes.belongsTo(Unites, { foreignKey: "id_unity" })
            Commandes.belongsTo(Users, { foreignKey: "createdby" })
            Commandes.findAll({
                order: [
                    ['id', 'DESC']
                ],
                include: [
                    {
                        model: Produits,
                        required: true,
                    },
                    {
                        model: Typelivraisons,
                        required: true,
                    },
                    {
                        model: Unites,
                        required: true,
                    },
                    {
                        model: Users,
                        required: true,
                    }
                ],
                where: {
                    updatedby: __id,
                    state: parseInt(status)
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
    beforevalidation: async (req: Request, res: Response, next: NextFunction) => {
        const { id_transaction, id_livreur, id_customer } = req.body
        if (!id_transaction || !id_livreur) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least !code_livraison || !id_transaction || !id_livreur")
        // log(req.body)
        try {
            const code_livraison = randomLongNumber({ length: 6 })
            const customer = await Users.findOne({ where: { id: id_customer } })
            const commandes = await Commandes.findAll({ where: { transaction: id_transaction, state: 2 } })
            if (customer instanceof Users) {
                if (commandes.length > 0) {
                    const { phone, nom, postnom, email } = customer.toJSON() as any
                    log(commandes.length)
                    Codelivraisons.findOrCreate({
                        defaults: {
                            code_livraison,
                            id_transaction,
                            description: JSON.stringify(req.body),
                            id_customer,
                            id_livreur
                        },
                        where: {
                            id_transaction
                        }
                    })
                        .then(([cd, isnew]) => {
                            if (cd instanceof Codelivraisons) {
                                if (!isnew) {
                                    cd.update({
                                        code_livraison
                                    })
                                }
                                Services.onSendSMS({
                                    to: phone,
                                    is_flash: false,
                                    content: `KG-${code_livraison} \nBonjour ${nom} ceci est votre de confirmation de livraison, ne le partagez qu'avec votre livreur !`
                                })
                                    .then(_ => { })
                                    .catch(_ => { })
                                return Responder(res, HttpStatusCode.Ok, cd)
                            } else {
                                return Responder(res, HttpStatusCode.NotAcceptable, cd)
                            }
                        })
                        .catch(err => {
                            return Responder(res, HttpStatusCode.InternalServerError, err)
                        })
                } else {
                    return Responder(res, HttpStatusCode.NotFound, "This request must have at least ::Commandes")
                }
            } else {
                return Responder(res, HttpStatusCode.NotFound, "This request must have at least ::Customer")
            }
        } catch (error) {
            log(error, id_customer, id_livreur, id_transaction)
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    validate: async (req: Request, res: Response) => {
        const { idcommande } = req.params;

        // log(req.body)

        if (!idcommande) return Responder(res, HttpStatusCode.NotAcceptable, "this request must have at least idcommande in the request !")
        const { id_transaction, id_livreur, code_livraison, id_customer } = req.body;
        if (!id_transaction || !id_livreur || !code_livraison || !id_customer) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least !id_transaction || !id_livreur || !code_livraison")

        const customer = await Users.findOne({ where: { id: id_customer } })

        const cmd = await Commandes.findAll({
            where: {
                transaction: (id_transaction),
                state: 2
            }
        })
        try {
            if (cmd.length > 0 && customer instanceof Users) {
                const { phone, nom, postnom, prenom, email } = customer.toJSON();
                Codelivraisons.findOne({
                    where: {
                        id_transaction,
                    }
                })
                    .then(cd => {
                        if (cd instanceof Codelivraisons) {
                            for (let index = 0; index < cmd.length; index++) {
                                const cm = cmd[index];
                                cm.update({
                                    state: 4// ie. done
                                })
                            }
                            Services.onSendSMS({
                                to: phone,
                                is_flash: false,
                                content: `Bonjour ${nom}, votre commande ${id_transaction} a été validé, merci pour votre confiance `
                            })
                                .then(_ => { })
                                .catch(_ => { })
                            return Responder(res, HttpStatusCode.Ok, { ...cmd, ...customer })
                        } else {
                            return Responder(res, HttpStatusCode.BadRequest, cd)
                        }
                    })
                    .catch(err => {
                        return Responder(res, HttpStatusCode.InternalServerError, err)
                    })
            } else {
                return Responder(res, HttpStatusCode.NotFound, cmd)
            }
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    changestate: async (req: Request, res: Response) => {
        const { idcommande: transaction } = req.params;
        const { currentuser } = req as any;
        const { __id, roles, uuid } = currentuser;
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
                            state: 2,
                            updatedby: __id
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