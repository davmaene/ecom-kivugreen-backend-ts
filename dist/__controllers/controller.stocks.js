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
const model_categories_1 = require("../__models/model.categories");
const model_unitemesures_1 = require("../__models/model.unitemesures");
const model_commandes_1 = require("../__models/model.commandes");
const model_typelivraison_1 = require("../__models/model.typelivraison");
const helper_all_1 = require("../__helpers/helper.all");
const model_histories_1 = require("../__models/model.histories");
exports.__controllerStocks = {
    history: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { currentuser } = req;
        const { __id, roles, uuid, phone } = currentuser;
        const { idstock } = req.params;
        if (!idstock)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least stockid");
        try {
            model_stocks_1.Stocks.belongsTo(model_cooperatives_1.Cooperatives, { foreignKey: "id_cooperative" });
            model_stocks_1.Stocks.belongsToMany(model_produits_1.Produits, { through: model_hasproducts_1.Hasproducts, }); // as: 'produits'
            model_stocks_1.Stocks.findOne({
                where: {
                    id: idstock
                },
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
                .then((stck) => __awaiter(void 0, void 0, void 0, function* () {
                if (stck instanceof model_stocks_1.Stocks) {
                    const __mouvements = [];
                    const { __tbl_ecom_cooperative, __tbl_ecom_produits, date_expiration, date_production, createdby, description, id_cooperative, transaction, createdAt, id, updatedAt } = stck.toJSON();
                    for (let index = 0; index < __tbl_ecom_produits.length; index++) {
                        const { id: asproduct, __tbl_ecom_hasproducts } = __tbl_ecom_produits[index];
                        const { id: ashasproduct, id_membre, qte, prix_unitaire, prix_plus_commission, currency } = __tbl_ecom_hasproducts;
                        // ============================================
                        model_commandes_1.Commandes.belongsTo(model_produits_1.Produits, { foreignKey: "id_produit" });
                        model_commandes_1.Commandes.belongsTo(model_typelivraison_1.Typelivraisons, { foreignKey: "type_livraison" });
                        const cmmds = yield model_commandes_1.Commandes.findAll({
                            include: [
                                {
                                    model: model_produits_1.Produits,
                                    required: false,
                                },
                                {
                                    model: model_typelivraison_1.Typelivraisons,
                                    required: false,
                                }
                            ],
                            where: {
                                id_produit: ashasproduct
                            }
                        });
                        __mouvements.push(Object.assign(Object.assign({}, __tbl_ecom_produits), { mouvements: Object.assign({}, __tbl_ecom_hasproducts) }));
                    }
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, Object.assign(Object.assign({}, stck.toJSON()), { mouvements: __mouvements }));
                }
                else {
                    (0, console_1.log)(stck);
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, stck);
                }
            }))
                .catch(er => {
                (0, console_1.log)(er);
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, er);
            });
        }
        catch (error) {
            (0, console_1.log)(error);
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    in: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id_cooperative, items, description, date_production, date_expiration } = req.body;
        const { currentuser } = req;
        if (!id_cooperative || !items)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least !id_cooperative || !items");
        if (!Array.isArray(items) || Array.from(items).length === 0)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "Items must be a type of Array");
        const array = Array.from(items);
        const { __id, roles, uuid, phone } = currentuser;
        const configs = yield model_configs_1.Configs.findOne({
            where: {
                id: 1
            }
        });
        console.log('====================================');
        console.log(array);
        console.log('====================================');
        try {
            const transaction = yield connecte_1.connect.transaction();
            model_stocks_1.Stocks.create({
                date_expiration,
                date_production,
                createdby: __id,
                id_cooperative: id_cooperative,
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
                            const { id_produit, qte, prix_unitaire, currency, date_production: asdate_production, id_member, qte_critique } = array[index];
                            if (!id_produit || !qte || !prix_unitaire || !currency || !asdate_production || !id_member) { // || !id_membre
                                nottreated.push(array[index]);
                            }
                            else {
                                try {
                                    const prd = yield model_produits_1.Produits.findOne({
                                        attributes: ['id', 'produit', 'id_unity', 'id_category', 'id_souscategory', 'image', 'tva'],
                                        where: {
                                            id: id_produit
                                        }
                                    });
                                    if (prd instanceof model_produits_1.Produits) {
                                        const { id, produit, id_unity, id_category, id_souscategory, image, tva } = prd.toJSON();
                                        const { id: asstockid } = stock.toJSON();
                                        if (produit && id_category && id_unity) {
                                            const [item, created] = yield model_hasproducts_1.Hasproducts.findOrCreate({
                                                where: {
                                                    TblEcomProduitId: id_produit,
                                                    TblEcomCooperativeId: id_cooperative
                                                },
                                                defaults: {
                                                    prix_plus_commission: prix_unitaire + (prix_unitaire * parseFloat(commission_price)) + (prix_unitaire * parseFloat(tva)),
                                                    currency,
                                                    tva,
                                                    qte_critique: qte_critique || 0,
                                                    prix_unitaire,
                                                    date_production: asdate_production,
                                                    TblEcomCategoryId: id_category,
                                                    TblEcomCooperativeId: id_cooperative,
                                                    TblEcomProduitId: id_produit,
                                                    TblEcomStockId: asstockid || 0,
                                                    TblEcomUnitesmesureId: id_unity,
                                                    qte,
                                                    id_membre: [id_member || 0]
                                                },
                                                transaction
                                            });
                                            if (created) {
                                                model_histories_1.Historiquesmembersstocks.create({
                                                    TblEcomUserId: id_member,
                                                    qte,
                                                    date_production: asdate_production,
                                                    TblEcomCategoryId: id_category,
                                                    TblEcomCooperativeId: id_cooperative,
                                                    TblEcomProduitId: id_produit,
                                                    TblEcomStockId: asstockid || 0,
                                                    TblEcomUnitesmesureId: id_unity,
                                                }, {});
                                                treated.push(array[index]);
                                            }
                                            else {
                                                const { qte: asqte, id_membre: asids } = item === null || item === void 0 ? void 0 : item.toJSON();
                                                model_histories_1.Historiquesmembersstocks.create({
                                                    TblEcomUserId: id_member,
                                                    qte,
                                                    date_production: asdate_production,
                                                    TblEcomCategoryId: id_category,
                                                    TblEcomCooperativeId: id_cooperative,
                                                    TblEcomProduitId: id_produit,
                                                    TblEcomStockId: asstockid || 0,
                                                    TblEcomUnitesmesureId: id_unity,
                                                }, {});
                                                const __ = !Array.isArray(asids) ? [asids] : asids;
                                                item.update({
                                                    id_membre: [...(0, helper_all_1.supprimerDoublons)({ tableau: [...__] })],
                                                    qte: qte + asqte
                                                });
                                                treated.push(Object.assign(Object.assign({}, array[index]), { produit }));
                                            }
                                        }
                                        else {
                                            (0, console_1.log)("We can not save this item cause it can not be proceced !", id_produit);
                                        }
                                    }
                                    else {
                                        nottreated.push(array[index]);
                                    }
                                }
                                catch (error) {
                                    nottreated.push(array[index]);
                                    // log(error)
                                    console.log('====================================');
                                    console.log(id_produit, prix_unitaire, commission_price, " ============> ", id_member);
                                    console.log('====================================');
                                    (0, console_1.log)("Error on treatement on object => ", id_produit, configs, error);
                                }
                            }
                        }
                        if (treated.length > 0) {
                            transaction.commit();
                            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, Object.assign(Object.assign({}, stock.toJSON()), { produits: treated }));
                        }
                        else {
                            transaction.rollback();
                            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, "this request must have at least Configurations params for the price !, the table of product is empty");
                        }
                    }
                    else {
                        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, "this request must have at least Configurations params for the price !, we can not initialize the commission and taux table");
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
            model_stocks_1.Stocks.findAll({
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
                .then((rows) => __awaiter(void 0, void 0, void 0, function* () {
                const __ = [];
                for (let index = 0; index < rows.length; index++) {
                    let items = [];
                    const { __tbl_ecom_produits } = rows[index].toJSON();
                    for (let index = 0; index < __tbl_ecom_produits.length; index++) {
                        const { id, produit, __tbl_ecom_hasproducts } = __tbl_ecom_produits[index];
                        const { TblEcomProduitId, TblEcomCategoryId, TblEcomUnitesmesureId } = __tbl_ecom_hasproducts;
                        const cat = yield model_categories_1.Categories.findOne({
                            // raw: true,
                            where: {
                                id: TblEcomCategoryId
                            }
                        });
                        const uni = yield model_unitemesures_1.Unites.findOne({
                            // raw: true,
                            where: {
                                id: TblEcomUnitesmesureId
                            }
                        });
                        items.push(Object.assign(Object.assign({}, __tbl_ecom_produits[index]), { __tbl_ecom_categories: cat === null || cat === void 0 ? void 0 : cat.toJSON(), __tbl_ecom_unitesmesures: uni === null || uni === void 0 ? void 0 : uni.toJSON() }));
                    }
                    __.push(Object.assign(Object.assign({}, rows[index].toJSON()), { __tbl_ecom_produits: [...items] }));
                }
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count: rows.length, rows: __ });
            }))
                .catch(error => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, error);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    getonebycoopec: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { idcooperative } = req.params;
        if (!idcooperative)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least idcooperative");
        try {
            model_stocks_1.Stocks.belongsTo(model_cooperatives_1.Cooperatives, { foreignKey: "id_cooperative" });
            model_stocks_1.Stocks.belongsToMany(model_produits_1.Produits, { through: model_hasproducts_1.Hasproducts }); // as: 'produits'
            model_stocks_1.Stocks.findAll({
                order: [
                    ['id', 'DESC'],
                ],
                // limit: 1,
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
                            id: parseInt(idcooperative)
                        },
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'email', 'sigle', 'cooperative', 'description']
                    }
                ]
            })
                .then((rows) => __awaiter(void 0, void 0, void 0, function* () {
                const __ = [];
                for (let index = 0; index < rows.length; index++) {
                    let items = [];
                    const { __tbl_ecom_produits } = rows[index].toJSON();
                    for (let index = 0; index < __tbl_ecom_produits.length; index++) {
                        const { id, produit, __tbl_ecom_hasproducts } = __tbl_ecom_produits[index];
                        const { TblEcomProduitId, TblEcomCategoryId, TblEcomUnitesmesureId } = __tbl_ecom_hasproducts;
                        const cat = yield model_categories_1.Categories.findOne({
                            // raw: true,
                            where: {
                                id: TblEcomCategoryId
                            }
                        });
                        const uni = yield model_unitemesures_1.Unites.findOne({
                            // raw: true,
                            where: {
                                id: TblEcomUnitesmesureId
                            }
                        });
                        items.push(Object.assign(Object.assign({}, __tbl_ecom_produits[index]), { __tbl_ecom_categories: cat === null || cat === void 0 ? void 0 : cat.toJSON(), __tbl_ecom_unitesmesures: uni === null || uni === void 0 ? void 0 : uni.toJSON() }));
                    }
                    __.push(Object.assign(Object.assign({}, rows[index].toJSON()), { __tbl_ecom_produits: [...items] }));
                }
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count: rows.length, rows: __ });
            }))
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
    getonebyid: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { idstock } = req.params;
        if (!idstock)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least idstock");
        try {
            model_stocks_1.Stocks.belongsTo(model_cooperatives_1.Cooperatives, { foreignKey: "id_cooperative" });
            model_stocks_1.Stocks.belongsToMany(model_produits_1.Produits, { through: model_hasproducts_1.Hasproducts, }); // as: 'produits'
            model_stocks_1.Stocks.findAll({
                where: {
                    id: idstock
                },
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
                        // where: {
                        //     id: idcooperative
                        // },
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'email', 'sigle', 'cooperative', 'description']
                    }
                ]
            })
                .then((rows) => __awaiter(void 0, void 0, void 0, function* () {
                const __ = [];
                for (let index = 0; index < rows.length; index++) {
                    let items = [];
                    const { __tbl_ecom_produits } = rows[index].toJSON();
                    for (let index = 0; index < __tbl_ecom_produits.length; index++) {
                        const { id, produit, __tbl_ecom_hasproducts } = __tbl_ecom_produits[index];
                        const { TblEcomProduitId, TblEcomCategoryId, TblEcomUnitesmesureId } = __tbl_ecom_hasproducts;
                        const cat = yield model_categories_1.Categories.findOne({
                            // raw: true,
                            where: {
                                id: TblEcomCategoryId
                            }
                        });
                        const uni = yield model_unitemesures_1.Unites.findOne({
                            // raw: true,
                            where: {
                                id: TblEcomUnitesmesureId
                            }
                        });
                        items.push(Object.assign(Object.assign({}, __tbl_ecom_produits[index]), { __tbl_ecom_categories: cat === null || cat === void 0 ? void 0 : cat.toJSON(), __tbl_ecom_unitesmesures: uni === null || uni === void 0 ? void 0 : uni.toJSON() }));
                    }
                    __.push(Object.assign(Object.assign({}, rows[index].toJSON()), { __tbl_ecom_produits: [...items] }));
                }
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count: rows.length, rows: __ });
            }))
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
