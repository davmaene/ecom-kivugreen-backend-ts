import { Request, Response } from "express";
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { Categoriescooperatives } from "../__models/model.categscooperatives";

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
    add: async (req: Request, res: Response,) => {
        const { category, description } = req.body
        if (!category || !description) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least !category || !description")
        try {
            Categoriescooperatives.create({
                category,
                description
            })
                .then((categ) => {
                    return Responder(res, HttpStatusCode.Ok, categ)
                })
                .catch(err => {
                    return Responder(res, HttpStatusCode.Conflict, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    update: async (req: Request, res: Response) => {
        const { category, description } = req.body
        if (Object.keys(req.body).length <= 0) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least !category || !description")
        const { idcateg } = req.params;
        try {
            Categoriescooperatives.update({
                category,
                description
            }, { where: { id: idcateg } })
                .then((categ) => {
                    return Responder(res, HttpStatusCode.Ok, categ)
                })
                .catch(err => {
                    return Responder(res, HttpStatusCode.Conflict, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    delete: async (req: Request, res: Response) => {
        const { idcateg } = req.params;
        try {
            Categoriescooperatives.destroy({ where: { id: idcateg } })
                .then((categ) => {
                    return Responder(res, HttpStatusCode.Ok, `Item with id ${idcateg} was successfuly deleted !`)
                })
                .catch(err => {
                    return Responder(res, HttpStatusCode.Conflict, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}