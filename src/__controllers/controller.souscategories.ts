import { Souscategories } from "../__models/model.souscategories";
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { Request, Response } from "express";

export const __controllerSouscategories = {
    list: async (req: Request, res: Response) => {
        try {
            Souscategories.findAndCountAll({
                where: {}
            })
                .then(r => Responder(res, HttpStatusCode.Ok, { ...r }))
                .catch(err => Responder(res, HttpStatusCode.Conflict, err))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    add: async (req: Request, res: Response) => {
        const { id_categorie, souscategory, description } = req.body
        if (!id_categorie || !description || !souscategory) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least !souscategory || !description")
        try {
            Souscategories.create({
                id_category: id_categorie,
                souscategory,
                description
            })
                .then(cat => {
                    if (cat instanceof Souscategories) return Responder(res, HttpStatusCode.Created, cat)
                    else return Responder(res, HttpStatusCode.BadRequest, cat)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    update: async (req: Request, res: Response) => {
        const { id } = req.params as any
        const { souscategory, description, id_category } = req.body;
        if (!id) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least id")
        if (Object.keys(req.body).length <= 0) return Responder(res, HttpStatusCode.NotAcceptable, "the body should not be empty!")
        try {
            Souscategories.findOne({
                where: {
                    id
                }
            })
                .then(cat => {
                    if (cat instanceof Souscategories) {
                        cat.update({
                            souscategory,
                            description,
                            id_category
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
            Souscategories.findOne({
                where: {
                    id
                }
            })
                .then(cat => {
                    if (cat instanceof Souscategories) {
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