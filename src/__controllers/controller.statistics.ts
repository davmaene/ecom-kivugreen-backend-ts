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

            const details = {
                
            }

            return Responder(res, HttpStatusCode.Ok, {
                stats
            })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}