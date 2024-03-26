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
exports.__controllerRoles = void 0;
const enum_httpsstatuscode_1 = require("../__enums/enum.httpsstatuscode");
const helper_responseserver_1 = require("../__helpers/helper.responseserver");
const model_roles_1 = require("../__models/model.roles");
const helper_all_1 = require("../__helpers/helper.all");
const serives_all_1 = require("../__services/serives.all");
exports.__controllerRoles = {
    list: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            model_roles_1.Roles.findAndCountAll({
                where: {}
            })
                .then(({ rows, count }) => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { rows, count });
            })
                .catch(err => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    addtouser: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id_roles, id_user } = req.body;
        if (!id_roles || !id_user)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least !id_roles || !id_user");
        if (!Array.isArray(id_roles))
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "id_roles must be a type of array !");
        try {
            serives_all_1.Services.addRoleToUser({
                inputs: {
                    idroles: [...id_roles],
                    iduser: id_user
                },
                transaction: null,
                cb: (err, ro) => {
                    if (ro) {
                        const { code, message, data } = ro;
                        if (code === 200) {
                            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, ro);
                        }
                        else
                            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.BadRequest, data);
                    }
                    else
                        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.BadRequest, err);
                }
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    add: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { role, description } = req.body;
        try {
            model_roles_1.Roles.create({
                role: (0, helper_all_1.capitalizeWords)({ text: role }),
                description
            })
                .then(ro => {
                if (ro instanceof model_roles_1.Roles)
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, ro);
                else
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, ro);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    })
};
