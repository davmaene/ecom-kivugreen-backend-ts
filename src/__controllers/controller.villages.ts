import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { Villages } from "../__models/model.villages";
import { NextFunction, Request, Response } from "express";

export const __controllerVillages = {
    list: async (req: Request, res: Response, next: NextFunction) => {
        Villages.findAndCountAll({
            where: {

            }
        })
            .then(({ count, rows }) => {
                return Responder(res, HttpStatusCode.Ok, { count, rows })
            })
            .catch(err => Responder(res, HttpStatusCode.InternalServerError, err))
    },
    listbyterritoire: async (req: Request, res: Response, next: NextFunction) => {
        const { idterritoire } = req.params
        if(!idterritoire) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least ! idterritoire")
        Villages.findAndCountAll({
            where: {
                idterritoire
            }
        })
            .then(({ count, rows }) => {
                return Responder(res, HttpStatusCode.Ok, { count, rows })
            })
            .catch(err => Responder(res, HttpStatusCode.InternalServerError, err))
    },
}