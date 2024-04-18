import { Commande, Commandes } from './../__models/model.commandes';
import { Paiements } from "../__models/model.payements";
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { Payements } from "../__services/services.payements";
import { log } from "console";
import { NextFunction, Request, Response } from "express";
import { Users } from "../__models/model.users";
import { Produits } from "__models/model.produits";
import { Hasproducts } from "../__models/model.hasproducts";
import { randomLongNumber } from '../__helpers/helper.random';

export const __controllerPayements = {
    list: async (req: Request, res: Response, next: NextFunction) => {
        try {
            Paiements.belongsTo(Users, { foreignKey: "createdby" })
            // Paiements.hasMany(Hasproducts, { foreignKey: "realref" })
            Paiements.findAll({
                include: [
                    {
                        model: Users,
                        required: true,
                        attributes: ['id', 'nom', 'postnom', 'prenom', 'phone', 'email']
                    }
                ],
                where: {}
            })
                .then(async list => {
                    const treated: any[] = []
                    for (let index = 0; index < list.length; index++) {
                        const { realref, reference } = list[index].toJSON() as any;
                        const prds: Commande[] = await Commandes.findAll({
                            raw: true,
                            where: {
                                transaction: realref
                            }
                        })
                        treated.push({
                            ...list[index].toJSON(),
                            __tbl_ecom_commandes: prds
                        })
                    }
                    return Responder(res, HttpStatusCode.Ok, treated)
                })
                .catch(err => Responder(res, HttpStatusCode.InternalServerError, err))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    listbystatus: async (req: Request, res: Response, next: NextFunction) => {
        const { status } = req.params;
        if (!status) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least status !")
        try {
            Paiements.hasOne(Users, { foreignKey: "createdby" })
            Paiements.findAll({
                where: {
                    status
                }
            })
                .then(list => {
                    return Responder(res, HttpStatusCode.Ok, list)
                })
                .catch(err => Responder(res, HttpStatusCode.InternalServerError, err))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    listbyowner: async (req: Request, res: Response, next: NextFunction) => {

    },
    makepayement: async (req: Request, res: Response, next: NextFunction) => {
        const { phone, amount, currency } = req.body;
        if (!phone || !amount || !currency)
            return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least !phone || !amount || !currency")
        try {
            Payements.pay({
                amount,
                currency,
                phone,
                createdby: 0,
                reference: randomLongNumber({ length: 13 })
            })
                .then(pay => {
                    const { code, data, message } = pay
                    log("Reesponse from payement ===> ", data)
                    return Responder(res, HttpStatusCode.Ok, data)
                })
                .catch((err: any) => {
                    log("Error on payement ==> ", err.toString())
                    return Responder(res, HttpStatusCode.InternalServerError, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}