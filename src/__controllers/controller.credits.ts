import { HttpStatusCode } from "__enums/enum.httpsstatuscode";
import { Responder } from "__helpers/helper.responseserver";
import { Users } from "__models";
import { Cooperatives } from "__models/model.cooperatives";
import { Credits } from "__models/model.credits";
import { Request, Response } from "express";

export const __controllersCredits = {
    list: async (req: Request, res: Response) => {
        try {
            Credits.belongsTo(Users, { foreignKey: "id_user" })
            Credits.belongsTo(Cooperatives, { foreignKey: "id_cooperative" })
            Credits.findAndCountAll({
                include: [
                    {
                        model: Cooperatives,
                        required: true
                    },
                    {
                        model: Users,
                        required: false
                    }
                ]
            })
                .then(({ rows, count }) => {
                    return Responder(res, HttpStatusCode.Ok, { count, rows })
                })
                .catch(err => {
                    return Responder(res, HttpStatusCode.InternalServerError, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}