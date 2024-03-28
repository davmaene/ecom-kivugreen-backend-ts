import { HttpStatusCode } from "__enums/enum.httpsstatuscode";
import { Responder } from "__helpers/helper.responseserver";
import { Categoriescooperatives } from "__models/model.categscooperatives";
import { Request, Response } from "express";

export const __controllerCategscooperatives = {
    list: async (req: Request, res: Response,) => {
        try {
            Categoriescooperatives.findAndCountAll({
                where: {}
            })
                .then(({ count, rows }) => {
                    return Responder(res, HttpStatusCode.Ok, { count, rows })
                })
                .catch(err => {
                    return Responder(res, HttpStatusCode.Conflict, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
}