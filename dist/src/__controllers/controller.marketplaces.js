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
exports.__controllerMarketplace = void 0;
const model_hasproducts_1 = require("../__models/model.hasproducts");
const enum_httpsstatuscode_1 = require("../__enums/enum.httpsstatuscode");
const helper_responseserver_1 = require("../__helpers/helper.responseserver");
const sequelize_1 = require("sequelize");
const model_produits_1 = require("../__models/model.produits");
const console_1 = require("console");
const model_unitemesures_1 = require("../__models/model.unitemesures");
const model_stocks_1 = require("../__models/model.stocks");
const model_cooperatives_1 = require("../__models/model.cooperatives");
exports.__controllerMarketplace = {
    placecommand: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { qte, id_produit } = req.body;
        const { currentuser } = req;
        const { __id, roles, uuid, phone } = currentuser;
        if (!qte || !id_produit)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least id_produit and qte !");
        try {
            model_hasproducts_1.Hasproducts.belongsTo(model_produits_1.Produits); // , { foreignKey: 'TblEcomProduitId' }
            model_hasproducts_1.Hasproducts.belongsTo(model_unitemesures_1.Unites); // , { foreignKey: 'TblEcomUnitesmesureId' }
            model_hasproducts_1.Hasproducts.belongsTo(model_stocks_1.Stocks); // , { foreignKey: 'TblEcomStockId' }
            model_hasproducts_1.Hasproducts.belongsTo(model_cooperatives_1.Cooperatives); // , { foreignKey: 'TblEcomCooperativeId' }
            model_hasproducts_1.Hasproducts.findOne({
                include: [
                    {
                        model: model_produits_1.Produits,
                        required: true,
                        attributes: ['id', 'produit', 'image', 'description']
                    },
                    {
                        model: model_unitemesures_1.Unites,
                        required: true,
                        attributes: ['id', 'unity', 'equival_kgs']
                    },
                    {
                        model: model_stocks_1.Stocks,
                        required: true,
                        attributes: ['id', 'transaction']
                    },
                    {
                        model: model_cooperatives_1.Cooperatives,
                        required: true,
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'cooperative', 'sigle']
                    }
                ],
                where: {
                    id: id_produit
                }
            })
                .then(has => {
                if (has instanceof model_hasproducts_1.Hasproducts) {
                    const { id, qte: asqte, prix_unitaire, currency, __tbl_ecom_produit, __tbl_ecom_unitesmesure, __tbl_ecom_stock, __tbl_ecom_cooperative } = has.toJSON();
                    if (qte <= asqte) {
                        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, has);
                    }
                    else {
                        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, `Commande received but the commanded qte is 'gt' the current store ! STORE:::${asqte} <==> QRY:::${qte}`);
                    }
                }
                else {
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotFound, has);
                }
            })
                .catch(err => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, err);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    marketplace: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let { page_size, page_number } = req.query;
        page_number = page_number ? parseInt(page_number) : 0;
        page_size = page_size ? parseInt(page_size) : 100;
        try {
            model_hasproducts_1.Hasproducts.belongsTo(model_produits_1.Produits); // , { foreignKey: 'TblEcomProduitId' }
            model_hasproducts_1.Hasproducts.belongsTo(model_unitemesures_1.Unites); // , { foreignKey: 'TblEcomUnitesmesureId' }
            model_hasproducts_1.Hasproducts.belongsTo(model_stocks_1.Stocks); // , { foreignKey: 'TblEcomStockId' }
            model_hasproducts_1.Hasproducts.belongsTo(model_cooperatives_1.Cooperatives); // , { foreignKey: 'TblEcomCooperativeId' }
            const offset = ((page_number) - 1) * (page_size);
            (0, console_1.log)(offset);
            model_hasproducts_1.Hasproducts.findAll({
                // attributes: ['id', 'qte', 'currency'],
                offset: (offset),
                limit: (page_size),
                include: [
                    {
                        model: model_produits_1.Produits,
                        required: true,
                        attributes: ['id', 'produit', 'image', 'description']
                    },
                    {
                        model: model_unitemesures_1.Unites,
                        required: true,
                        attributes: ['id', 'unity', 'equival_kgs']
                    },
                    {
                        model: model_stocks_1.Stocks,
                        required: true,
                        attributes: ['id', 'transaction']
                    },
                    {
                        model: model_cooperatives_1.Cooperatives,
                        required: true,
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'cooperative', 'sigle']
                    }
                ],
                where: {
                    qte: { [sequelize_1.Op.gte]: 0 }
                }
            })
                .then((rows) => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, rows);
            })
                .catch(err => {
                (0, console_1.log)(err);
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, err);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    addtopanier: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    deletepanier: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { idpanier } = req.body;
        if (!idpanier)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least idpanier !");
        try {
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    validatepanier: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { idpanier } = req.body;
        if (!idpanier)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least idpanier !");
        try {
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    })
};
