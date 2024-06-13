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
exports.__controlerStatistics = void 0;
const enum_httpsstatuscode_1 = require("../__enums/enum.httpsstatuscode");
const helper_responseserver_1 = require("../__helpers/helper.responseserver");
const model_users_1 = require("../__models/model.users");
const model_hasroles_1 = require("../__models/model.hasroles");
const model_roles_1 = require("../__models/model.roles");
const model_cooperatives_1 = require("../__models/model.cooperatives");
const model_banks_1 = require("../__models/model.banks");
const model_produits_1 = require("../__models/model.produits");
const model_commandes_1 = require("../__models/model.commandes");
const helper_moment_1 = require("../__helpers/helper.moment");
const helper_all_1 = require("../__helpers/helper.all");
exports.__controlerStatistics = {
    dashboard: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            model_users_1.Users.belongsToMany(model_roles_1.Roles, { through: model_hasroles_1.Hasroles });
            model_roles_1.Roles.belongsToMany(model_users_1.Users, { through: model_hasroles_1.Hasroles });
            const __customers = yield model_users_1.Users.findAll({
                include: [
                    {
                        model: model_roles_1.Roles,
                        required: true,
                        where: {
                            id: 5 // means user who is ecom-user
                        }
                    }
                ],
                where: {}
            });
            const __users = yield model_users_1.Users.findAll({
                where: {}
            });
            const __cooperatives = yield model_cooperatives_1.Cooperatives.findAll({
                where: {}
            });
            const __banks = yield model_banks_1.Banks.findAll({
                where: {}
            });
            const __products = yield model_produits_1.Produits.findAll({
                where: {}
            });
            const __commandes = yield model_commandes_1.Commandes.findAll({
                where: {}
            });
            const stats = {
                users: __users.length,
                customers: __customers.length,
                cooperatives: __cooperatives.length,
                banks: __banks.length,
                products: __products.length,
                commandes: __commandes.length
            };
            const __u = (0, helper_all_1.groupArrayElementByColumn)({
                arr: __users === null || __users === void 0 ? void 0 : __users.map((m) => {
                    const { createdAt } = m.toJSON();
                    return Object.assign(Object.assign({}, m), { createdAt: (0, helper_moment_1.__endOfTheDayWithDate)({ date: createdAt }) });
                }),
                columnName: 'createdAt',
                convertColumn: false
            });
            const __c = (0, helper_all_1.groupArrayElementByColumn)({
                arr: __customers === null || __customers === void 0 ? void 0 : __customers.map((m) => {
                    const { createdAt } = m.toJSON();
                    return Object.assign(Object.assign({}, m), { createdAt: (0, helper_moment_1.__endOfTheDayWithDate)({ date: createdAt }) });
                }),
                columnName: 'createdAt',
                convertColumn: false
            });
            // Array.from(__users).map(d => __endOfTheDayWithDate({ date: d['createdAt'] as any }))
            const details = {
                users: {
                    length: __users === null || __users === void 0 ? void 0 : __users.length,
                    xAxis: [...Object.keys(__u).map(_ => (0, helper_moment_1.unixToDate)({ unix: parseInt(_) }))],
                    yAxis: [...Array.from(Object.values(__u)).map((c) => Array.from(c).length)]
                },
                customers: {
                    length: __customers === null || __customers === void 0 ? void 0 : __customers.length,
                    xAxis: [...Object.keys(__c).map(_ => (0, helper_moment_1.unixToDate)({ unix: parseInt(_) }))],
                    yAxis: [...Array.from(Object.values(__c)).map((c) => Array.from(c).length)]
                }
            };
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, {
                stats,
                details
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    historique: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    })
};
