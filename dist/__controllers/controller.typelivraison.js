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
exports.__controllerTypelivraison = void 0;
const enum_httpsstatuscode_1 = require("../__enums/enum.httpsstatuscode");
const helper_responseserver_1 = require("../__helpers/helper.responseserver");
const model_typelivraison_1 = require("../__models/model.typelivraison");
exports.__controllerTypelivraison = {
    list: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            model_typelivraison_1.Typelivraisons.findAndCountAll({
                where: {}
            })
                .then(({ rows, count }) => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count, rows });
            })
                .catch(err => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, err);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    add: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { frais_livraison, quantite, type, description, lieux } = req.body;
        if (!frais_livraison || !quantite || !type || !description || !lieux)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least !frais_livraison || !quantite || !type || !description || !lieux");
        try {
            model_typelivraison_1.Typelivraisons.create({
                frais_livraison: parseFloat(frais_livraison),
                quantite: parseInt(quantite),
                type,
                description,
                lieux
            })
                .then((typel) => {
                if (typel instanceof model_typelivraison_1.Typelivraisons)
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, typel);
            })
                .catch(err => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, err);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    update: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { frais_livraison, quantite, type, description, lieux } = req.body;
        if (Object.keys(req.body).length <= 0)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least !frais_livraison || !quantite || !type || !description || !lieux");
        try {
            model_typelivraison_1.Typelivraisons.create(Object.assign({}, req.body
            // frais_livraison: parseFloat(frais_livraison),
            // quantite: parseInt(quantite),
            // type,
            // description,
            // lieux
            ))
                .then((typel) => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, type);
            })
                .catch(err => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, err);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    delete: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        if (!id)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least !frais_livraison || !quantite || !type || !description || !lieux");
        try {
            model_typelivraison_1.Typelivraisons.destroy({
                where: {
                    id
                }
            })
                .then((typel) => {
                if (typel !== 0)
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, `Item successfuly deleted !`);
                else
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, `Item with status ${id} was not found !`);
            })
                .catch(err => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, err);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
};
