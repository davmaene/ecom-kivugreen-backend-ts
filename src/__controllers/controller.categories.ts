import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { Categories } from "../__models/model.categories";
import { Request, Response } from "express";

export const __controllerCategories = {
    list: async (req: Request, res: Response) => {
        try {
            Categories.findAndCountAll({
                order: [
                    ['id', 'DESC']
                ],
                where: {}
            })
                .then(r => Responder(res, HttpStatusCode.Ok, { ...r }))
                .catch(err => Responder(res, HttpStatusCode.Conflict, err))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    add: async (req: Request, res: Response) => {
        const { category, description } = req.body
        if (!category || !description) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least !category || !description")
        try {
            Categories.create({
                category,
                description
            })
                .then(cat => {
                    if (cat instanceof Categories) return Responder(res, HttpStatusCode.Created, cat)
                    else return Responder(res, HttpStatusCode.BadRequest, cat)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    update: async (req: Request, res: Response) => {
        const { id } = req.params as any
        const { category, description } = req.body;
        if (!id) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least id")
        if (Object.keys(req.body).length <= 0) return Responder(res, HttpStatusCode.NotAcceptable, "the body should not be empty!")
        try {
            Categories.findOne({
                where: {
                    id
                }
            })
                .then(cat => {
                    if (cat instanceof Categories) {
                        cat.update({
                            category,
                            description
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
            Categories.findOne({
                where: {
                    id
                }
            })
                .then(cat => {
                    if (cat instanceof Categories) {
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