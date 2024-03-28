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
    },
    add: async (req: Request, res: Response, next: NextFunction) => {
        const { frais_livraison, quantite, type, description, lieux } = req.body
        if (!frais_livraison || !quantite || !type || !description || !lieux) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least !frais_livraison || !quantite || !type || !description || !lieux")
        try {
            Typelivraisons.create({
                frais_livraison: parseFloat(frais_livraison),
                quantite: parseInt(quantite),
                type,
                description,
                lieux
            })
                .then((typel) => {
                    if (typel instanceof Typelivraisons)
                        return Responder(res, HttpStatusCode.Ok, type)
                })
                .catch(err => {
                    return Responder(res, HttpStatusCode.Conflict, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },

}