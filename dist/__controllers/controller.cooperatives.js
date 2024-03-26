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
exports.__controllerCooperatives = void 0;
const model_cooperatives_1 = require("../__models/model.cooperatives");
const enum_httpsstatuscode_1 = require("../__enums/enum.httpsstatuscode");
const helper_responseserver_1 = require("../__helpers/helper.responseserver");
const serives_all_1 = require("../__services/serives.all");
const console_1 = require("console");
const model_users_1 = require("../__models/model.users");
const model_hasmembers_1 = require("../__models/model.hasmembers");
const helper_random_1 = require("../__helpers/helper.random");
exports.__controllerCooperatives = {
    list: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            model_users_1.Users.belongsToMany(model_cooperatives_1.Cooperatives, { through: model_hasmembers_1.Hasmembers });
            model_cooperatives_1.Cooperatives.belongsToMany(model_users_1.Users, { through: model_hasmembers_1.Hasmembers });
            model_cooperatives_1.Cooperatives.findAndCountAll({
                where: {},
                include: [
                    {
                        model: model_users_1.Users,
                        required: false,
                        attributes: ['id', 'nom', 'postnom', 'prenom', 'phone', 'email']
                        // isAliased: false,
                        // as: "resposable"
                    }
                ]
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
        const { isformel } = req.body;
        let payload = Object.assign({}, req.body);
        try {
            if (parseInt(isformel) === 1) {
                if (!req.files)
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "Please upload a attached file for this cooperative !");
                const { code, message, data } = yield serives_all_1.Services.uploadfile({
                    inputs: {
                        file: req,
                        saveas: 'as_docs',
                        type: 'file'
                    }
                });
                if (code === 200) {
                    const { filename, fullpath } = data;
                    payload['file'] = fullpath;
                }
                else {
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "The file was not successfuly uploaded, Error on uploading the file !");
                }
            }
            payload['isformel'] = parseInt(payload['isformel']);
            payload['id_category'] = parseInt(payload['id_category']);
            payload['id_responsable'] = parseInt(payload['id_responsable']);
            payload['id_adjoint'] = parseInt(payload['id_adjoint']);
            payload['id_territoire'] = parseInt(payload['id_territoire']);
            model_cooperatives_1.Cooperatives.create(Object.assign(Object.assign({}, payload), { num_enregistrement: (0, helper_random_1.randomLongNumber)({ length: 12 }) }))
                .then(coopec => {
                if (coopec instanceof model_cooperatives_1.Cooperatives)
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, coopec);
                else
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, coopec);
            })
                .catch(err => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, err);
            });
        }
        catch (error) {
            (0, console_1.log)(error);
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    addmemebers: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { ids_members, id_cooperative } = req.body;
        if (!ids_members || !id_cooperative)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least ids_members and id_cooperative !");
        try {
            serives_all_1.Services.addMembersToCoopec({
                inputs: {
                    idcooperative: parseInt(id_cooperative),
                    idmembers: [...ids_members],
                },
                transaction: null,
                cb: (err, done) => {
                    if (done) {
                        const { code, message, data } = done;
                        if (code === 200) {
                            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, data);
                        }
                        else {
                            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, "Error on initializing members table !");
                        }
                    }
                    else {
                        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, "Error on initializing members table !");
                    }
                }
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    delete: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { idcooperative } = req.params;
        try {
            model_cooperatives_1.Cooperatives.findByPk(idcooperative)
                .then(coopec => {
                if (coopec instanceof model_cooperatives_1.Cooperatives) {
                    coopec.destroy({ force: true })
                        .then(D => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, D))
                        .catch(Er => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, Er));
                }
                else {
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotFound, coopec);
                }
            })
                .catch(err => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    update: (res, req) => __awaiter(void 0, void 0, void 0, function* () {
        const { idcooperative } = req.params;
        if (idcooperative)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least idccoperative !");
        if (Object.keys(req.body).length <= 0)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "The body should not be empty !");
        try {
            model_cooperatives_1.Cooperatives.update(Object.assign({}, req.body), {
                where: {
                    id: parseInt(idcooperative)
                }
            })
                .then(U => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, U))
                .catch(Err => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, Err));
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    })
};
