import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { Produits } from "../__models/model.produits";
import { ServiceImage } from "../__services/services.images";
import { log } from "console";
import { NextFunction, Request, Response } from "express";

export const __controllerProduits = {
    add: async (req: Request, res: Response, next: NextFunction) => {
        const { id_unity, id_category, id_souscategory, description } = req.body;
        const { currentuser } = req;
        const { __id, roles, uuid, phone } = currentuser
        if (!req.files) return Responder(res, HttpStatusCode.NotAcceptable, "Please provide the image file for the product !")
        try {
            const saveas = 'as_images'
            ServiceImage.onUploadImage({
                inputs: {
                    file: req,
                    type: 'image',
                    saveas
                },
                callBack: (err: any, done: any) => {
                    if (done) {
                        const { code, message, data } = done;
                        ServiceImage.onRemoveBGFromImage({
                            inputs: {
                                ...data,
                                directory: saveas
                            },
                            callBack: (er: any, success: any) => {
                                if (success) {
                                    const { code, message, data } = success;
                                    if (code === 200) {
                                        const { filename, path } = data
                                        Produits.create({
                                            id_unity: parseInt(id_unity),
                                            id_category: parseInt(id_category),
                                            description,
                                            id_souscategory: parseInt(id_souscategory),
                                            createdby: __id
                                        })
                                    } else {
                                        return Responder(res, HttpStatusCode.BadRequest, "Failed to remove bg to the file sorry !")
                                    }
                                } else {
                                    return Responder(res, HttpStatusCode.BadRequest, er)
                                }
                            }
                        })
                    } else {
                        return Responder(res, HttpStatusCode.BadRequest, "Bad request was sent into procedur !")
                    }
                }
            })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    list: (req: Request, res: Response, next: NextFunction) => {
        try {
            Produits.findAndCountAll({
                where: {}
            })
                .then(({ count, rows }) => Responder(res, HttpStatusCode.Ok, { count, rows }))
                .catch(err => Responder(res, HttpStatusCode.BadRequest, err))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}