import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { Provinces } from "../__models/model.provinces";
import { NextFunction, Response, Request } from "express";

export const __controllerProvinces = {
    list: async (req: Request, res: Response, next: NextFunction) => {
        try {
            Provinces.findAndCountAll({
                where: {}
            })
                .then(({ rows, count }) => {
                    return Responder(res, HttpStatusCode.Ok, { count, rows })
                })
                .catch(err => Responder(res, HttpStatusCode.Conflict, err))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}