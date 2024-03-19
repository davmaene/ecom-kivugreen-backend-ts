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
        if(!id_categorie || !description || !souscategory) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least !category || !description")
        try {
            Souscategories.create({
                id_category: id_categorie,
                souscategory,
                description
            })
            .then(cat => {
                if(cat instanceof Souscategories) return Responder(res, HttpStatusCode.Created, cat)
                else return Responder(res, HttpStatusCode.BadRequest, cat)
            })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}