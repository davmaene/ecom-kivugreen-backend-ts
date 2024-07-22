import { Unites } from "../__models/model.unitemesures";
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { Request, Response } from "express";

export const __controllerUnities = {
    list: async (req: Request, res: Response) => {
        try {
            Unites.findAndCountAll({
                where: {}
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
    add: async (req: Request, res: Response) => {
        const { unity, equival_kgs, description } = req.body
        if (!unity || !equival_kgs || !description) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least !unity || !equival_kgs || !description")
        try {
            Unites.create({
                equival_kgs,
                description,
                unity
            })
                .then(unit => {
                    if (unit instanceof Unites) {
                        return Responder(res, HttpStatusCode.Ok, unit)
                    } else {
                        return Responder(res, HttpStatusCode.BadRequest, unit)
                    }
                })
                .catch(err => {
                    return Responder(res, HttpStatusCode.Conflict, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    update: async (req: Request, res: Response) => {
        const { id } = req.params as any
        const { unity, description, equival_kgs } = req.body;
        if (!id) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least id")
        if (Object.keys(req.body).length <= 0) return Responder(res, HttpStatusCode.NotAcceptable, "the body should not be empty!")
        try {
            Unites.findOne({
                where: {
                    id
                }
            })
                .then(cat => {
                    if (cat instanceof Unites) {
                        cat.update({
                            unity,
                            description,
                            equival_kgs
                        })
                            .then(_ => Responder(res, HttpStatusCode.Ok, cat))
                            .catch(__ => Responder(res, HttpStatusCode.NotFound, "Item not found"))
                    } else {
                        return Responder(res, HttpStatusCode.NotFound, "Item not found")
                    }
                })
                .catch(Err => Responder(res, HttpStatusCode.NotAcceptable, Err))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    delete: async (req: Request, res: Response,) => {
        const { id } = req.params as any
        if (!id) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least id")
        try {
            Unites.findOne({
                where: {
                    id
                }
            })
                .then(cat => {
                    if (cat instanceof Unites) {
                        cat.destroy()
                            .then(_ => Responder(res, HttpStatusCode.Ok, `Item with id:::${id} was successfuly deleted `))
                    } else {
                        return Responder(res, HttpStatusCode.NotFound, "Item not found")
                    }
                })
                .catch(Err => Responder(res, HttpStatusCode.NotAcceptable, Err))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}