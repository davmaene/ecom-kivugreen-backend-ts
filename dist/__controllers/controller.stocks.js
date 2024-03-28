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
exports.__controllerStocks = void 0;
const helper_random_1 = require("./../__helpers/helper.random");
const model_stocks_1 = require("../__models/model.stocks");
const enum_httpsstatuscode_1 = require("../__enums/enum.httpsstatuscode");
const helper_responseserver_1 = require("../__helpers/helper.responseserver");
const model_produits_1 = require("../__models/model.produits");
const console_1 = require("console");
const model_cooperatives_1 = require("../__models/model.cooperatives");
const model_hasproducts_1 = require("../__models/model.hasproducts");
const connecte_1 = require("../__databases/connecte");
const model_configs_1 = require("../__models/model.configs");
exports.__controllerStocks = {
    in: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id_ccoperative, items, description } = req.body;
        const { currentuser } = req;
        if (!id_ccoperative || !items)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least !id_ccoperative || !items");
        if (!Array.isArray(items) || Array.from(items).length === 0)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "Items must be a type of Array");
        const array = Array.from(items);
        const { __id, roles, uuid, phone } = currentuser;
        const configs = yield model_configs_1.Configs.findOne({
            // raw: true,
            // order: [['id', "DESC"]]
            where: {
                id: 1
            }
        });
        try {
            const transaction = yield connecte_1.connect.transaction();
            model_stocks_1.Stocks.create({
                date_expiration: '',
                date_production: '',
                createdby: __id,
                id_cooperative: id_ccoperative,
                transaction: (0, helper_random_1.randomLongNumber)({ length: 15 }),
                description
            }, { transaction })
                .then((stock) => __awaiter(void 0, void 0, void 0, function* () {
                if (stock instanceof model_stocks_1.Stocks) {
                    const treated = [];
                    const nottreated = [];
                    if (configs instanceof model_configs_1.Configs) {
                        const { taux_change, commission_price } = configs.toJSON();
                        for (let index = 0; index < array.length; index++) {
                            const { id_produit, qte, prix_unitaire, currency } = array[index];
                            try {
                                const prd = yield model_produits_1.Produits.findOne({
                                    attributes: ['id', 'produit', 'id_unity', 'id_category', 'id_souscategory', 'image'],
                                    where: {
                                        id: id_produit
                                    }
                                });
                                if (prd instanceof model_produits_1.Produits) {
                                    const { id, produit, id_unity, id_category, id_souscategory, image } = prd.toJSON();
                                    const { id: asstockid } = stock.toJSON();
                                    if (produit && id_category && id_souscategory && id_unity) {
                                        const [item, created] = yield model_hasproducts_1.Hasproducts.findOrCreate({
                                            where: {
                                                TblEcomProduitId: id_produit,
                                                TblEcomCooperativeId: id_ccoperative
                                            },
                                            defaults: {
                                                prix_plus_commission: prix_unitaire + (prix_unitaire * parseFloat(commission_price)),
                                                currency,
                                                prix_unitaire,
                                                TblEcomCategorieId: id_category,
                                                TblEcomCooperativeId: id_ccoperative,
                                                TblEcomProduitId: id_produit,
                                                TblEcomStockId: asstockid || 0,
                                                TblEcomUnitesmesureId: id_unity,
                                                qte
                                            },
                                            transaction
                                        });
                                        if (created) {
                                            nottreated.push(array[index]);
                                        }
                                        else {
                                            const { qte: asqte } = item.toJSON();
                                            item.update({
                                                qte: qte + asqte
                                            });
                                            treated.push(array[index]);
                                        }
                                    }
                                }
                                else {
                                    nottreated.push(array[index]);
                                }
                            }
                            catch (error) {
                                nottreated.push(array[index]);
                                (0, console_1.log)("Error on treatement on object => ", id_produit);
                            }
                        }
                        transaction.commit();
                        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, stock);
                    }
                    else {
                        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, "this request must hava at least Configurations params for the price !");
                    }
                }
                else {
                    transaction.rollback();
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, {});
                }
            }))
                .catch(err => {
                transaction.rollback();
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, err);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    list: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            model_stocks_1.Stocks.belongsTo(model_cooperatives_1.Cooperatives, { foreignKey: "id_cooperative" });
            model_stocks_1.Stocks.belongsToMany(model_produits_1.Produits, { through: model_hasproducts_1.Hasproducts, }); // as: 'produits'
            model_stocks_1.Stocks.findAndCountAll({
                where: {},
                include: [
                    {
                        model: model_produits_1.Produits,
                        // as: 'produits',
                        required: true,
                        attributes: ['id', 'produit']
                    },
                    {
                        model: model_cooperatives_1.Cooperatives,
                        required: true,
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'email', 'sigle', 'cooperative', 'description']
                    }
                ]
            })
                .then(({ count, rows }) => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count, rows }))
                .catch(error => {
                (0, console_1.log)(error);
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, error);
            });
        }
        catch (error) {
            (0, console_1.log)(error);
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    getonebycoopec: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { idcooperative } = req.params;
        if (!idcooperative)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least idcooperative");
        try {
            model_stocks_1.Stocks.belongsTo(model_cooperatives_1.Cooperatives, { foreignKey: "id_cooperative" });
            model_stocks_1.Stocks.belongsToMany(model_produits_1.Produits, { through: model_hasproducts_1.Hasproducts, }); // as: 'produits'
            model_stocks_1.Stocks.findAndCountAll({
                where: {},
                include: [
                    {
                        model: model_produits_1.Produits,
                        // as: 'produits',
                        required: true,
                        attributes: ['id', 'produit']
                    },
                    {
                        model: model_cooperatives_1.Cooperatives,
                        required: true,
                        where: {
                            id: idcooperative
                        },
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'email', 'sigle', 'cooperative', 'description']
                    }
                ]
            })
                .then(({ count, rows }) => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count, rows }))
                .catch(error => {
                (0, console_1.log)(error);
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, error);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    })
};
