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
exports.__controllerMembers = void 0;
const model_users_1 = require("../__models/model.users");
const enum_httpsstatuscode_1 = require("../__enums/enum.httpsstatuscode");
const helper_responseserver_1 = require("../__helpers/helper.responseserver");
const model_hasmembers_1 = require("../__models/model.hasmembers");
const console_1 = require("console");
const model_cooperatives_1 = require("../__models/model.cooperatives");
const sequelize_1 = require("sequelize");
exports.__controllerMembers = {
    list: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            model_hasmembers_1.Hasmembers.belongsTo(model_users_1.Users, { foreignKey: "TblEcomUserId" });
            model_hasmembers_1.Hasmembers.belongsTo(model_cooperatives_1.Cooperatives);
            model_hasmembers_1.Hasmembers.findAll({
                where: {},
                include: [
                    {
                        model: model_users_1.Users,
                        required: true,
                        attributes: ['id', 'nom', 'postnom', 'prenom', 'prenom', 'phone', 'email']
                    },
                    {
                        model: model_cooperatives_1.Cooperatives,
                        required: true
                    }
                ]
            })
                .then((list) => __awaiter(void 0, void 0, void 0, function* () {
                // const __: any[] = []
                // for (let index = 0; index < list.length; index++) {
                //     const { TblEcomUserId } = list[index].toJSON() as any;
                //     const element = list[index].toJSON() as any;
                //     const extra = await Extras.findOne({
                //         attributes: ['id','carte', 'date_expiration', 'date_expiration_unix', 'createdAt'],
                //         where: {
                //             id_user: TblEcomUserId
                //         }
                //     })
                //     __.push({
                //         ...extra?.toJSON(),
                //         ...element,
                //     })
                // }
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count: list.length, rows: list });
            }))
                .catch(err => {
                (0, console_1.log)(err);
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    listbycooperative: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { idcooperative } = req.params;
        if (!idcooperative)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "this request must have at least idcooperative ");
        try {
            model_hasmembers_1.Hasmembers.belongsTo(model_users_1.Users, { foreignKey: "TblEcomUserId" });
            model_hasmembers_1.Hasmembers.belongsTo(model_cooperatives_1.Cooperatives);
            model_hasmembers_1.Hasmembers.findAll({
                where: {
                    TblEcomCooperativeId: parseInt(idcooperative)
                },
                include: [
                    {
                        model: model_users_1.Users,
                        required: true,
                        attributes: ['id', 'nom', 'postnom', 'prenom', 'prenom', 'phone', 'email']
                    },
                    {
                        model: model_cooperatives_1.Cooperatives,
                        required: true,
                    }
                ]
            })
                .then((list) => __awaiter(void 0, void 0, void 0, function* () {
                // const __: any[] = []
                // for (let index = 0; index < list.length; index++) {
                //     const { TblEcomUserId } = list[index].toJSON() as any;
                //     const element = list[index].toJSON() as any;
                //     const extra = await Extras.findOne({
                //         attributes: ['id','carte', 'date_expiration', 'date_expiration_unix', 'createdAt'],
                //         where: {
                //             id_user: TblEcomUserId
                //         }
                //     })
                //     __.push({
                //         ...extra?.toJSON(),
                //         ...element,
                //     })
                // }
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count: list.length, rows: list });
            }))
                .catch(err => {
                (0, console_1.log)(err);
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    listbyothercooperative: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { idcooperative } = req.params;
        if (!idcooperative)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "this request must have at least idcooperative ");
        try {
            model_hasmembers_1.Hasmembers.belongsTo(model_users_1.Users, { foreignKey: "TblEcomUserId" });
            model_hasmembers_1.Hasmembers.belongsTo(model_cooperatives_1.Cooperatives);
            model_hasmembers_1.Hasmembers.findAll({
                where: {
                    TblEcomCooperativeId: {
                        [sequelize_1.Op.ne]: idcooperative
                    }
                },
                include: [
                    {
                        model: model_users_1.Users,
                        required: true,
                        attributes: ['id', 'nom', 'postnom', 'prenom', 'prenom', 'phone', 'email']
                    },
                    {
                        model: model_cooperatives_1.Cooperatives,
                        required: true,
                    }
                ]
            })
                .then((list) => __awaiter(void 0, void 0, void 0, function* () {
                // const __: any[] = []
                // for (let index = 0; index < list.length; index++) {
                //     const { TblEcomUserId } = list[index].toJSON() as any;
                //     const element = list[index].toJSON() as any;
                //     const extra = await Extras.findOne({
                //         attributes: ['id','carte', 'date_expiration', 'date_expiration_unix', 'createdAt'],
                //         where: {
                //             id_user: TblEcomUserId
                //         }
                //     })
                //     __.push({
                //         ...extra?.toJSON(),
                //         ...element,
                //     })
                // }
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count: list.length, rows: list });
            }))
                .catch(err => {
                (0, console_1.log)(err);
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
};
