"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__controllerProduits = void 0;
const helper_all_1 = require("../__helpers/helper.all");
const enum_httpsstatuscode_1 = require("../__enums/enum.httpsstatuscode");
const helper_responseserver_1 = require("../__helpers/helper.responseserver");
const model_produits_1 = require("../__models/model.produits");
const services_images_1 = require("../__services/services.images");
exports.__controllerProduits = {
    add: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id_unity, id_category, id_souscategory, description, produit } = req.body;
        const { currentuser } = req;
        const { __id, roles, uuid, phone } = currentuser;
        if (!req.files)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "Please provide the image file for the product !");
        try {
            const saveas = 'as_images';
            services_images_1.ServiceImage.onUploadImage({
                inputs: {
                    file: req,
                    type: 'image',
                    saveas
                },
                callBack: (err, done) => {
                    if (done) {
                        const { code, message, data } = done;
                        if (code === 200) {
                            services_images_1.ServiceImage.onRemoveBGFromImage({
                                inputs: Object.assign(Object.assign({}, data), { saveas, directory: saveas }),
                                callBack: (er, success) => {
                                    if (success) {
                                        const { code, message, data } = success;
                                        if (code === 200) {
                                            const { filename, path } = data;
                                            model_produits_1.Produits.create({
                                                produit: (0, helper_all_1.capitalizeWords)({ text: produit }),
                                                image: path,
                                                id_unity: parseInt(id_unity),
                                                id_category: parseInt(id_category),
                                                description,
                                                id_souscategory: parseInt(id_souscategory),
                                                createdby: __id
                                            })
                                                .then(prd => {
                                                if (prd instanceof model_produits_1.Produits)
                                                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, prd);
                                                else
                                                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.BadRequest, prd);
                                            })
                                                .catch(err => {
                                                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, err);
                                            });
                                        }
                                        else {
                                            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.BadRequest, "Failed to remove bg to the file sorry !");
                                        }
                                    }
                                    else {
                                        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.BadRequest, er);
                                    }
                                }
                            });
                        }
                        else {
                            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.BadRequest, "Failed to upload product !");
                        }
                    }
                    else {
                        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.BadRequest, "Bad request was sent into procedur !");
                    }
                }
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    list: (req, res, next) => {
        try {
            model_produits_1.Produits.findAndCountAll({
                where: {}
            })
                .then(({ count, rows }) => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count, rows }))
                .catch(err => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.BadRequest, err));
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }
};
