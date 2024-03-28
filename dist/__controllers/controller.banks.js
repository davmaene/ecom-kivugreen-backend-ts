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
exports.__controllerBanks = void 0;
const helper_fillphone_1 = require("../__helpers/helper.fillphone");
const enum_httpsstatuscode_1 = require("../__enums/enum.httpsstatuscode");
const helper_responseserver_1 = require("../__helpers/helper.responseserver");
const __models_1 = require("../__models");
const model_banks_1 = require("../__models/model.banks");
exports.__controllerBanks = {
    list: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            model_banks_1.Banks.belongsTo(__models_1.Users, { foreignKey: "id_responsable" });
            model_banks_1.Banks.findAndCountAll({
                where: {},
                include: [
                    {
                        model: __models_1.Users,
                        required: true,
                        attributes: ["id", "nom", "postnom", "prenom", "phone", "email"]
                    }
                ]
            })
                .then(({ rows, count }) => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count, rows, });
            })
                .catch(err => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, err));
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    add: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { phone } = req.body;
        try {
            model_banks_1.Banks.create(Object.assign(Object.assign({}, req.body), { phone: (0, helper_fillphone_1.fillphone)({ phone }) }))
                .then(bnk => {
                if (bnk instanceof model_banks_1.Banks)
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, bnk);
                else
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, bnk);
            })
                .catch(err => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err));
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    update: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { phone } = req.body;
        const { idbank } = req.params;
        try {
            model_banks_1.Banks.update(Object.assign({}, req.body), {
                where: {
                    id: parseInt(idbank)
                }
            })
                .then(bnk => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, bnk);
                // if (bnk instanceof Banks) return Responder(res, HttpStatusCode.Ok, bnk)
                // else return Responder(res, HttpStatusCode.Conflict, bnk)
            })
                .catch(err => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err));
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    delete: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { idbank } = req.params;
        try {
            model_banks_1.Banks.destroy({
                where: {
                    id: parseInt(idbank)
                }
            })
                .then(dest => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, `Item with status ${idbank} was successfuly deleted !`))
                .catch(err => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.BadRequest, err));
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    })
};
