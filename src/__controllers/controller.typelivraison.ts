import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { Typelivraisons } from "../__models/model.typelivraison";
import { NextFunction, Request, Response } from "express";

export const __controllerTypelivraison = {
    list: async (req: Request, res: Response, next: NextFunction) => {
        try {
            Typelivraisons.findAndCountAll({
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