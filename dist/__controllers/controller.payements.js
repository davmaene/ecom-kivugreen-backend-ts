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
exports.__controllerPayements = void 0;
const model_commandes_1 = require("./../__models/model.commandes");
const model_payements_1 = require("../__models/model.payements");
const enum_httpsstatuscode_1 = require("../__enums/enum.httpsstatuscode");
const helper_responseserver_1 = require("../__helpers/helper.responseserver");
const services_payements_1 = require("../__services/services.payements");
const console_1 = require("console");
const model_users_1 = require("../__models/model.users");
const helper_random_1 = require("../__helpers/helper.random");
exports.__controllerPayements = {
    list: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            model_payements_1.Paiements.belongsTo(model_users_1.Users, { foreignKey: "createdby" });
            // Paiements.hasMany(Hasproducts, { foreignKey: "realref" })
            model_payements_1.Paiements.findAll({
                include: [
                    {
                        model: model_users_1.Users,
                        required: true,
                        attributes: ['id', 'nom', 'postnom', 'prenom', 'phone', 'email']
                    }
                ],
                where: {}
            })
                .then((list) => __awaiter(void 0, void 0, void 0, function* () {
                const treated = [];
                for (let index = 0; index < list.length; index++) {
                    const { realref, reference } = list[index].toJSON();
                    const prds = yield model_commandes_1.Commandes.findAll({
                        raw: true,
                        where: {
                            transaction: realref
                        }
                    });
                    treated.push(Object.assign(Object.assign({}, list[index].toJSON()), { __tbl_ecom_commandes: prds }));
                }
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, treated);
            }))
                .catch(err => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err));
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    listbystatus: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { status } = req.params;
        if (!status)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least status !");
        try {
            model_payements_1.Paiements.hasOne(model_users_1.Users, { foreignKey: "createdby" });
            model_payements_1.Paiements.findAll({
                where: {
                    status
                }
            })
                .then(list => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, list);
            })
                .catch(err => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err));
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    listbyowner: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    }),
    makepayement: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { phone, amount, currency } = req.body;
        if (!phone || !amount || !currency)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least !phone || !amount || !currency");
        try {
            services_payements_1.Payements.pay({
                amount,
                currency,
                phone,
                createdby: 0,
                reference: (0, helper_random_1.randomLongNumber)({ length: 13 })
            })
                .then(pay => {
                const { code, data, message } = pay;
                (0, console_1.log)("Reesponse from payement ===> ", data);
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, data);
            })
                .catch((err) => {
                (0, console_1.log)("Error on payement ==> ", err.toString());
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    })
};
