import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { Users } from "../__models/model.users";
import { Hasroles } from "../__models/model.hasroles";
import { Roles } from "../__models/model.roles";
import { NextFunction, Request, Response } from "express";
import { Cooperatives } from "../__models/model.cooperatives";
import { Banks } from "../__models/model.banks";
import { Produits } from "../__models/model.produits";
import { Commandes } from "../__models/model.commandes";
import { __endOfTheDayWithDate, unixToDate } from "../__helpers/helper.moment";
import { calcPriceAsSomme, groupArrayElementByColumn, groupedDataByColumn } from "../__helpers/helper.all";
import { Typelivraisons } from "../__models/model.typelivraison";
import { Unites } from "../__models/model.unitemesures";
import { log } from "console";
import { Historiquesmembersstocks } from "../__models/model.histories";
import { Categories } from "../__models/model.categories";

export const __controlerStatistics = {
    dashboard: async (req: Request, res: Response, next: NextFunction) => {
        try {
            Users.belongsToMany(Roles, { through: Hasroles });
            Roles.belongsToMany(Users, { through: Hasroles });
            const __customers = await Users.findAll({
                include: [
                    {
                        model: Roles,
                        required: true,
                        where: {
                            id: 5 // means user who is ecom-user
                        }
                    }
                ],
                where: {

                }
            })
            const __users = await Users.findAll({
                where: {

                }
            })
            const __cooperatives = await Cooperatives.findAll({
                where: {}
            })
            const __banks = await Banks.findAll({
                where: {}
            })
            const __products = await Produits.findAll({
                where: {}
            })
            const __commandes = await Commandes.findAll({
                where: {

                }
            })

            const stats = {
                users: __users.length,
                customers: __customers.length,
                cooperatives: __cooperatives.length,
                banks: __banks.length,
                products: __products.length,
                commandes: __commandes.length
            }

            const __u = groupArrayElementByColumn({
                arr: __users?.map((m: any) => {
                    const { createdAt } = m.toJSON() as any;
                    return {
                        ...m,
                        createdAt: __endOfTheDayWithDate({ date: createdAt })
                    }
                }),
                columnName: 'createdAt',
                convertColumn: false
            })

            const __c = groupArrayElementByColumn({
                arr: __customers?.map((m: any) => {
                    const { createdAt } = m.toJSON() as any;
                    return {
                        ...m,
                        createdAt: __endOfTheDayWithDate({ date: createdAt })
                    }
                }),
                columnName: 'createdAt',
                convertColumn: false
            })
            // Array.from(__users).map(d => __endOfTheDayWithDate({ date: d['createdAt'] as any }))
            const details = {
                users: {
                    length: __users?.length,
                    xAxis: [...Object.keys(__u).map(_ => unixToDate({ unix: parseInt(_) }))],
                    yAxis: [...Array.from(Object.values(__u)).map((c: any) => Array.from(c).length)]
                },
                customers: {
                    length: __customers?.length,
                    xAxis: [...Object.keys(__c).map(_ => unixToDate({ unix: parseInt(_) }))],
                    yAxis: [...Array.from(Object.values(__c)).map((c: any) => Array.from(c).length)]
                }
            }

            return Responder(res, HttpStatusCode.Ok, {
                stats,
                details
            })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    historiquevalidatedcommandes: async (req: Request, res: Response, next: NextFunction) => {
        const { idcooperative } = req.params
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
                attributes: ['id', 'id_produit', 'type_livraison', 'id_unity', 'createdby', 'id_cooperative', 'transaction', 'qte', 'prix_total', 'currency', 'payament_phone', 'createdAt', 'state', 'state'],
                include: [
                    {
                        model: Produits,
                        required: true,
                        attributes: ['tva', 'produit', 'image']
                    },
                    {
                        model: Typelivraisons,
                        required: true,
                        attributes: ['type']
                    },
                    {
                        model: Unites,
                        required: true,
                        attributes: ['unity']
                    },
                    {
                        model: Users,
                        required: true,
                        attributes: ['nom', 'postnom', 'phone']
                    }
                ],
                where: {
                    id_cooperative: idcooperative,
                    state: 4
                }
            })
                .then(commandes => {
                    // const groupes = groupedDataByColumn({ column: "transaction", data: commandes })
                   const prices = calcPriceAsSomme({ array: commandes, column: 'prix_total' })
                    return Responder(res, HttpStatusCode.Ok, { valorisation: prices,count: commandes.length, rows: commandes })
                })
                .catch(err => {
                    return Responder(res, HttpStatusCode.InternalServerError, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    historiquevalidatedcommandesformember: async (req: Request, res: Response, next: NextFunction) => {
        const { id_member:idcooperative } = req.params
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
                attributes: ['id', 'id_produit', 'type_livraison', 'id_unity', 'createdby', 'id_cooperative', 'transaction', 'qte', 'prix_total', 'currency', 'payament_phone', 'createdAt', 'state', 'state'],
                include: [
                    {
                        model: Produits,
                        required: true,
                        attributes: ['tva', 'produit', 'image']
                    },
                    {
                        model: Typelivraisons,
                        required: true,
                        attributes: ['type']
                    },
                    {
                        model: Unites,
                        required: true,
                        attributes: ['unity']
                    },
                    {
                        model: Users,
                        required: true,
                        attributes: ['nom', 'postnom', 'phone']
                    }
                ],
                where: {
                    id_cooperative: idcooperative,
                    state: 4
                }
            })
                .then(commandes => {
                    // const groupes = groupedDataByColumn({ column: "transaction", data: commandes })
                   const prices = calcPriceAsSomme({ array: commandes, column: 'prix_total' })
                    return Responder(res, HttpStatusCode.Ok, { valorisation: prices,count: commandes.length, rows: commandes })
                })
                .catch(err => {
                    return Responder(res, HttpStatusCode.InternalServerError, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    historiqueapprovisonnementmember: async (req: Request, res: Response, ) => {
        const { id_member } = req.params as any
        if (!id_member) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least id_cooperative")
        const { currentuser } = req as any;
        const { __id, roles, uuid, phone } = currentuser;
        try {

            Historiquesmembersstocks.belongsTo(Cooperatives)
            Historiquesmembersstocks.belongsTo(Users)
            Historiquesmembersstocks.belongsTo(Produits)
            Historiquesmembersstocks.belongsTo(Categories)
            Historiquesmembersstocks.belongsTo(Unites)

            Historiquesmembersstocks.findAndCountAll({
                order: [
                    ['id', 'DESC']
                ],
                where: {
                    TblEcomUserId: id_member
                },
                include: [
                    {
                        model: Cooperatives,
                        required: true,
                        attributes: ['id', 'adresse', 'phone', 'num_enregistrement', 'cooperative']
                    },
                    {
                        model: Users,
                        required: true,
                        attributes: ['id', 'nom', 'postnom', 'prenom', 'phone', 'email'],
                        where: {
                            id: id_member
                        }
                    },
                    {
                        model: Produits,
                        required: true,
                        attributes: ['id', 'produit']
                    },
                    {
                        model: Categories,
                        required: true,
                        attributes: ['id', 'category']
                    },
                    {
                        model: Unites,
                        required: true,
                        attributes: ['id', 'unity', 'equival_kgs']
                    },
                    // {
                    //     model: Stocks,
                    //     required: true
                    // }
                ]
            })
                .then(({ rows, count }) => {
                    return Responder(res, HttpStatusCode.Ok, { count, rows })
                })
                .catch(err => {
                    log(err)
                    return Responder(res, HttpStatusCode.InternalServerError, err)
                })
        } catch (error) {
            log(error)
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}