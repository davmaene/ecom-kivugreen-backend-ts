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
exports.__controllerTerritoires = void 0;
const enum_httpsstatuscode_1 = require("../__enums/enum.httpsstatuscode");
const helper_responseserver_1 = require("../__helpers/helper.responseserver");
const model_provinces_1 = require("../__models/model.provinces");
const model_territoires_1 = require("../__models/model.territoires");
exports.__controllerTerritoires = {
    list: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            model_territoires_1.Territoires.belongsTo(model_provinces_1.Provinces, { foreignKey: 'idprovince' });
            model_territoires_1.Territoires.findAndCountAll({
                where: {},
                include: [
                    {
                        model: model_provinces_1.Provinces,
                        required: true
                    }
                ]
            })
                .then(({ count, rows }) => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count, rows }))
                .catch(err => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, err));
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    listbyprovince: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { idprovince } = req.params;
        try {
            model_territoires_1.Territoires.findAndCountAll({
                where: {
                    idprovince: parseInt(idprovince)
                }
            })
                .then(({ count, rows }) => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count, rows }))
                .catch(err => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, err));
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    })
};
