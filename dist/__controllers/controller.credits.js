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
exports.__controllersCredits = void 0;
const enum_httpsstatuscode_1 = require("../__enums/enum.httpsstatuscode");
const helper_responseserver_1 = require("../__helpers/helper.responseserver");
const __models_1 = require("../__models");
const model_cooperatives_1 = require("../__models/model.cooperatives");
const model_credits_1 = require("../__models/model.credits");
exports.__controllersCredits = {
    list: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            model_credits_1.Credits.belongsTo(__models_1.Users, { foreignKey: "id_user" });
            model_credits_1.Credits.belongsTo(model_cooperatives_1.Cooperatives, { foreignKey: "id_cooperative" });
            model_credits_1.Credits.findAndCountAll({
                include: [
                    {
                        model: model_cooperatives_1.Cooperatives,
                        required: true
                    },
                    {
                        model: __models_1.Users,
                        required: false
                    }
                ]
            })
                .then(({ rows, count }) => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count, rows });
            })
                .catch(err => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    listbystatus: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { status } = req.params;
        if (!status)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NoContent, "This request must have at least status");
        try {
            model_credits_1.Credits.belongsTo(__models_1.Users, { foreignKey: "id_user" });
            model_credits_1.Credits.belongsTo(model_cooperatives_1.Cooperatives, { foreignKey: "id_cooperative" });
            model_credits_1.Credits.findAndCountAll({
                include: [
                    {
                        model: model_cooperatives_1.Cooperatives,
                        required: true
                    },
                    {
                        model: __models_1.Users,
                        required: false
                    }
                ]
            })
                .then(({ rows, count }) => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count, rows });
            })
                .catch(err => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    add: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            model_credits_1.Credits.create(Object.assign({}, req.body))
                .then(crd => {
                if (crd instanceof model_credits_1.Credits)
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, crd);
                else
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, crd);
            })
                .catch(er => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, er));
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    update: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { idcredit } = req.params;
        if (!idcredit)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NoContent, "This request must have at least idcredit");
        if (Object.keys(req.body).length <= 0)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least somes keys in body !");
        try {
            model_credits_1.Credits.update(Object.assign({}, req.body), {
                where: {
                    id: idcredit
                }
            })
                .then(crd => {
                if (crd)
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, crd);
                else
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, crd);
            })
                .catch(er => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, er));
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    delete: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { idcredit } = req.params;
        if (!idcredit)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NoContent, "This request must have at least idcredit");
        try {
            model_credits_1.Credits.destroy({
                where: {
                    id: idcredit
                }
            })
                .then(crd => {
                if (crd !== 0)
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, `Item with id:::${idcredit} was successfuly deleted !`);
                else
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotFound, `Item with id:::${idcredit} not found !`);
            })
                .catch(er => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, er));
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    })
};
