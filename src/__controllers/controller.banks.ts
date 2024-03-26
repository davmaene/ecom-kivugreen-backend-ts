import { fillphone } from "../__helpers/helper.fillphone";
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { Users } from "../__models";
import { Banks } from "../__models/model.banks";
import { NextFunction, Request, Response } from "express";

export const __controllerBanks = {
    list: async (req: Request, res: Response, next: NextFunction) => {
        try {
            Banks.belongsTo(Users, { foreignKey: "id_responsable" })
            Banks.findAndCountAll({
                where: {},
                include: [
                    {
                        model: Users,
                        required: true
                    }
                ]
            })
                .then(({ rows, count }) => {
                    return Responder(res, HttpStatusCode.Ok, { rows, count })
                })
                .catch(err => Responder(res, HttpStatusCode.Conflict, err))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    add: async (req: Request, res: Response, next: NextFunction) => {
        const { phone } = req.body
        try {
            Banks.create({
                ...req.body,
                phone: fillphone({ phone })
            })
                .then(bnk => {
                    if (bnk instanceof Banks) return Responder(res, HttpStatusCode.Ok, bnk)
                    else return Responder(res, HttpStatusCode.Conflict, bnk)
                })
                .catch(err => Responder(res, HttpStatusCode.InternalServerError, err))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}