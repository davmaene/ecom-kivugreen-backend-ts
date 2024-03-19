import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { Categories } from "../__models/model.categories";
import { Request, Response } from "express";

export const __controllerCategories = {
    list: async (req: Request, res: Response) => {
        try {
            Categories.findAndCountAll({
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
        if(!category || !description) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least !category || !description")
        try {
            Categories.create({
                category,
                description
            })
            .then(cat => {
                if(cat instanceof Categories) return Responder(res, HttpStatusCode.Created, cat)
                else return Responder(res, HttpStatusCode.BadRequest, cat)
            })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}