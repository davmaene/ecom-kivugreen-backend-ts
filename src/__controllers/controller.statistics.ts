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
import { groupArrayElementByColumn } from "../__helpers/helper.all";

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
    }
}