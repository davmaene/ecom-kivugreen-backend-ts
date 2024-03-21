import { Configs } from "../__models/model.configs";
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import e, { Request, Response } from "express";

export const __controllerConfigs = {
    add: async (req: Request, res: Response) => {
        const { taux_change, commission_price } = req.body;
        if (!taux_change || !commission_price) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least !taux_change || !commission_price")
        try {
            Configs.create({
                taux_change: parseFloat(taux_change),
                commission_price: parseFloat(commission_price)
            })
                .then(conf => {
                    if (conf instanceof Configs) {
                        return Responder(res, HttpStatusCode.Ok, conf)
                    } else return Responder(res, HttpStatusCode.Conflict, conf)
                })
                .catch(err => {
                    return Responder(res, HttpStatusCode.Conflict, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    get: async (req: Request, res: Response) => {
        try {
            Configs.findOne({
                limit: 1,
                order: [['id', 'desc']],
                where: {
                    // id: 
                }
            })
                .then(conf => {
                    if (conf instanceof Configs) return Responder(res, HttpStatusCode.Ok, conf)
                    else return Responder(res, HttpStatusCode.NotAcceptable, {})
                })
                .catch(err => {
                    return Responder(res, HttpStatusCode.InternalServerError, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}