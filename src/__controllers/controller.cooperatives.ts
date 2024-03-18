import { Cooperatives } from "../__models/model.cooperatives"
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode"
import { Responder } from "../__helpers/helper.responseserver"
import { NextFunction, Request, Response } from "express"

export const __controllerCooperatives = {
    list: async (req: Request, res: Response, next: NextFunction) => {
        try {
            Cooperatives.findAndCountAll({
                where: {}
            })
                .then(({ rows, count }) => {
                    return Responder(res, HttpStatusCode.Ok, { count, rows })
                })
                .catch(err => {
                    return Responder(res, HttpStatusCode.Conflict, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}