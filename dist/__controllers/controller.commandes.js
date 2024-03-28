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
exports.__controllerCommandes = void 0;
const model_commandes_1 = require("../__models/model.commandes");
const enum_httpsstatuscode_1 = require("../__enums/enum.httpsstatuscode");
const helper_responseserver_1 = require("../__helpers/helper.responseserver");
const model_produits_1 = require("../__models/model.produits");
exports.__controllerCommandes = {
    list: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            model_commandes_1.Commandes.belongsTo(model_produits_1.Produits, { foreignKey: "id_produit" });
            model_commandes_1.Commandes.findAll({
                include: [
                    {
                        model: model_produits_1.Produits,
                        required: false,
                    }
                ],
                where: {}
            })
                .then(commandes => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count: commandes.length, rows: commandes });
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    listbyowner: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    }),
    listbystate: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    })
};
