import { log } from "console";
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { Users } from "../__models";
import { Cooperatives } from "../__models/model.cooperatives";
import { Credits } from "../__models/model.credits";
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
    },
    listbystatus: async (req: Request, res: Response) => {
        const { status } = req.params
        if (!status) return Responder(res, HttpStatusCode.NoContent, "This request must have at least status")
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
    },
    add: async (req: Request, res: Response,) => {
        try {
            Credits.create({
                ...req.body
            })
                .then(crd => {
                    if (crd instanceof Credits) return Responder(res, HttpStatusCode.Ok, crd)
                    else return Responder(res, HttpStatusCode.Conflict, crd)
                })
                .catch(er => Responder(res, HttpStatusCode.InternalServerError, er))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    update: async (req: Request, res: Response,) => {
        const { idcredit } = req.params
        if (!idcredit) return Responder(res, HttpStatusCode.NoContent, "This request must have at least idcredit")
        if(Object.keys(req.body).length <= 0) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least somes keys in body !")
        try {
            Credits.update({
                ...req.body
            }, {
                where: {
                    id: idcredit
                }
            })
                .then(crd => {
                    if (crd) return Responder(res, HttpStatusCode.Ok, crd)
                    else return Responder(res, HttpStatusCode.Conflict, crd)
                })
                .catch(er => Responder(res, HttpStatusCode.InternalServerError, er))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    delete: async (req: Request, res: Response,) => {
        const { idcredit } = req.params
        if (!idcredit) return Responder(res, HttpStatusCode.NoContent, "This request must have at least idcredit")
        try {
            Credits.destroy({
                where: {
                    id: idcredit
                }
            })
                .then(crd => {
                    if(crd !== 0) return Responder(res, HttpStatusCode.Ok, `Item with id:::${idcredit} was successfuly deleted !`)
                   else return Responder(res, HttpStatusCode.NotFound, `Item with id:::${idcredit} not found !`)
                })
                .catch(er => Responder(res, HttpStatusCode.InternalServerError, er))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}