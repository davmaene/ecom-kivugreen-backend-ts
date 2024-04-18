import { capitalizeWords } from "../__helpers/helper.all";
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { Produits } from "../__models/model.produits";
import { ServiceImage } from "../__services/services.images";
import { log } from "console";
import { NextFunction, Request, Response } from "express";
import { Categories } from "../__models/model.categories";
import { Souscategories } from "../__models/model.souscategories";
import { Unites } from "../__models/model.unitemesures";

export const __controllerProduits = {
    add: async (req: Request, res: Response, next: NextFunction) => {
        const { id_unity, id_category, id_souscategory, description, produit } = req.body;
        const { currentuser } = req as any;
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
                    log("On upload Image ==> ", done, err)
                    if (done) {
                        const { code, message, data } = done;
                        if (code === 200) {
                            const { filename, fullpath: slink } = data
                            Produits.create({
                                produit: capitalizeWords({ text: produit }),
                                image: slink,
                                id_unity: parseInt(id_unity),
                                id_category: parseInt(id_category),
                                description,
                                id_souscategory: parseInt(id_souscategory),
                                createdby: __id
                            })
                                .then(prd => {
                                    if (prd instanceof Produits) return Responder(res, HttpStatusCode.Ok, prd)
                                    else return Responder(res, HttpStatusCode.BadRequest, prd)
                                })
                                .catch(err => {
                                    return Responder(res, HttpStatusCode.Conflict, err)
                                })
                            return false
                            ServiceImage.onRemoveBGFromImage({
                                inputs: {
                                    ...data,
                                    saveas,
                                    directory: saveas
                                },
                                callBack: (er: any, success: any) => {
                                    log("On remove Bg ==> ", success, er)
                                    if (success) {
                                        const { code, message, data } = success;
                                        if (code === 200) {
                                            const { filename, path } = data
                                            Produits.create({
                                                produit: capitalizeWords({ text: produit }),
                                                image: path,
                                                id_unity: parseInt(id_unity),
                                                id_category: parseInt(id_category),
                                                description,
                                                id_souscategory: parseInt(id_souscategory),
                                                createdby: __id
                                            })
                                                .then(prd => {
                                                    if (prd instanceof Produits) return Responder(res, HttpStatusCode.Ok, prd)
                                                    else return Responder(res, HttpStatusCode.BadRequest, prd)
                                                })
                                                .catch(err => {
                                                    return Responder(res, HttpStatusCode.Conflict, err)
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
                            return Responder(res, HttpStatusCode.BadRequest, "Failed to upload product !")
                        }
                    } else {
                        return Responder(res, HttpStatusCode.BadRequest, "Bad request was sent into procedur !")
                    }
                }
            })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    list: async (req: Request, res: Response, next: NextFunction) => {
        try {
            Produits.belongsTo(Categories, { foreignKey: "id_category" })
            Produits.belongsTo(Souscategories, { foreignKey: "id_souscategory" })
            Produits.belongsTo(Unites, { foreignKey: "id_unity" })
            Produits.findAndCountAll({
                where: {},
                include:[
                    {
                        model: Unites,
                        required: true
                    },
                    {
                        model: Categories,
                        required: true
                    },
                    {
                        model: Souscategories,
                        required: false
                    }
                ]
            })
                .then(({ count, rows }) => Responder(res, HttpStatusCode.Ok, { count, rows }))
                .catch(err => Responder(res, HttpStatusCode.BadRequest, err))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    update: async (req: Request, res: Response, next: NextFunction) => {
        const { idproduit } = req.params;
        if (!idproduit) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least idproduit in params !")
        if (Object.keys(req.body).length <= 0) return Responder(res, HttpStatusCode.NotAcceptable, "The request of the body should not be empty !")
        try {
            Produits.update({
                ...req.body
            }, {
                where: {
                    id: idproduit
                }
            })
                .then(prd => {
                    return Responder(res, HttpStatusCode.Ok, "Item updated successfuly !")
                })
                .catch(err => Responder(res, HttpStatusCode.InternalServerError, err))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    delete: async (req: Request, res: Response, next: NextFunction) => {
        const { idproduit } = req.params;
        if (!idproduit) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least idproduit in params !")
        try {
            Produits.destroy({
                where: {
                    id: idproduit
                }
            })
                .then(prd => {
                    if (prd !== 0)
                        return Responder(res, HttpStatusCode.Ok, "Item updated successfuly !")
                    else return Responder(res, HttpStatusCode.NotFound, `Item with ${idproduit} was not found `)
                })
                .catch(err => Responder(res, HttpStatusCode.InternalServerError, err))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}