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
const helper_random_1 = require("./../__helpers/helper.random");
const model_hasproducts_1 = require("../__models/model.hasproducts");
const enum_httpsstatuscode_1 = require("../__enums/enum.httpsstatuscode");
const helper_responseserver_1 = require("../__helpers/helper.responseserver");
const sequelize_1 = require("sequelize");
const model_produits_1 = require("../__models/model.produits");
const console_1 = require("console");
const model_unitemesures_1 = require("../__models/model.unitemesures");
const model_stocks_1 = require("../__models/model.stocks");
const model_cooperatives_1 = require("../__models/model.cooperatives");
const model_commandes_1 = require("../__models/model.commandes");
const model_users_1 = require("../__models/model.users");
const serives_all_1 = require("../__services/serives.all");
const helper_fillphone_1 = require("../__helpers/helper.fillphone");
const connecte_1 = require("../__databases/connecte");
exports.__controllerMarketplace = {
    placecommand: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { currentuser } = req;
        const { __id, roles, uuid } = currentuser;
        const { items, type_livraison, payament_phone, currency_payement } = req.body;
        if (!items || !Array.isArray(items) || !type_livraison)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least items and can not be empty ! and type_livraison");
        try {
            const treated = [];
            const c_treated = [];
            const c_nottreated = [];
            const nottreated = [];
            const transaction = (0, helper_random_1.randomLongNumber)({ length: 13 });
            const tr_ = yield connecte_1.connect.transaction();
            const currentUser = yield model_users_1.Users.findOne({
                where: {
                    id: __id
                }
            });
            if (currentUser instanceof model_users_1.Users) {
                const { phone, email, nom } = currentUser.toJSON();
                for (let index = 0; index < Array.from(items).length; index++) {
                    const { id_produit, qte } = items[index];
                    model_hasproducts_1.Hasproducts.belongsTo(model_produits_1.Produits); // , { foreignKey: 'TblEcomProduitId' }
                    model_hasproducts_1.Hasproducts.belongsTo(model_unitemesures_1.Unites); // , { foreignKey: 'TblEcomUnitesmesureId' }
                    model_hasproducts_1.Hasproducts.belongsTo(model_stocks_1.Stocks); // , { foreignKey: 'TblEcomStockId' }
                    model_hasproducts_1.Hasproducts.belongsTo(model_cooperatives_1.Cooperatives); // , { foreignKey: 'TblEcomCooperativeId' }
                    const has = yield model_hasproducts_1.Hasproducts.findOne({
                        transaction: tr_,
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
                    });
                    if (has instanceof model_hasproducts_1.Hasproducts) {
                        const { id, qte: asqte, prix_unitaire, currency, __tbl_ecom_produit, __tbl_ecom_unitesmesure, __tbl_ecom_stock, __tbl_ecom_cooperative } = has.toJSON();
                        if (qte <= asqte) {
                            treated.push(Object.assign(Object.assign({}, has.toJSON()), { qte }));
                        }
                        else {
                            nottreated.push({ item: has.toJSON(), message: `Commande received but the commanded qte is 'gt' the current store ! STORE:::${asqte} <==> QRY:::${qte}` });
                        }
                    }
                    else {
                        nottreated.push({ item: items[index], message: `Item can not be found !` });
                    }
                }
                if (treated.length > 0) {
                    const somme = [];
                    for (let index = 0; index < treated.length; index++) {
                        const { id, qte, prix_unitaire, currency, __tbl_ecom_cooperative, __tbl_ecom_stock, __tbl_ecom_unitesmesure, __tbl_ecom_produit } = treated[index];
                        const { produit } = __tbl_ecom_produit;
                        const { unity } = __tbl_ecom_unitesmesure;
                        let price = parseFloat(prix_unitaire) * parseFloat(qte);
                        let { code, data, message } = yield serives_all_1.Services.converterDevise({ amount: price, currency: currency_payement || currency });
                        if (code === 200) {
                            const { amount: converted_price, currency: converted_currency } = data;
                            somme.push(converted_price);
                            const cmmd = yield model_commandes_1.Commandes.create({
                                id_produit: id,
                                is_pending: 1,
                                payament_phone: payament_phone || phone,
                                currency: converted_currency,
                                prix_total: converted_price,
                                prix_unit: prix_unitaire,
                                qte,
                                state: 0,
                                transaction,
                                type_livraison,
                                createdby: __id
                            }, { transaction: tr_ });
                            if (cmmd instanceof model_commandes_1.Commandes) {
                                serives_all_1.Services.onSendSMS({
                                    is_flash: true,
                                    to: (0, helper_fillphone_1.fillphone)({ phone }),
                                    content: `Bonjour ${nom} nous avons reçu votre commande de (${qte}${unity}) de ${produit}, un push message vous sera envoyé veuillez acceptez le paiement sur votre téléphone, montant à payer ${converted_price}${converted_currency}, transID: ${transaction}`
                                })
                                    .then(sms => { })
                                    .catch((err) => { });
                                c_treated.push(cmmd);
                            }
                            else {
                                // tr_.rollback()
                                c_nottreated.push(cmmd);
                            }
                        }
                        else {
                            // tr_.rollback()
                        }
                    }
                    tr_.commit();
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { c_treated, c_nottreated });
                }
                else {
                    tr_.rollback();
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, "Commande can not be proceded cause the table of all commande is empty !");
                }
            }
            else {
                tr_.rollback();
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, `User can not be found in ---USER:${__id} `);
            }
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
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count: rows.length, list: rows });
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
    }),
    searchbykeyword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { keyword } = req.params;
        const page_number = 1;
        const page_size = 1000;
        try {
            model_hasproducts_1.Hasproducts.belongsTo(model_produits_1.Produits); // , { foreignKey: 'TblEcomProduitId' }
            model_hasproducts_1.Hasproducts.belongsTo(model_unitemesures_1.Unites); // , { foreignKey: 'TblEcomUnitesmesureId' }
            model_hasproducts_1.Hasproducts.belongsTo(model_stocks_1.Stocks); // , { foreignKey: 'TblEcomStockId' }
            model_hasproducts_1.Hasproducts.belongsTo(model_cooperatives_1.Cooperatives); // , { foreignKey: 'TblEcomCooperativeId' }
            const offset = ((page_number) - 1) * (page_size);
            model_hasproducts_1.Hasproducts.findAll({
                // attributes: ['id', 'qte', 'currency'],
                offset: (offset),
                limit: (page_size),
                include: [
                    {
                        model: model_produits_1.Produits,
                        required: true,
                        attributes: ['id', 'produit', 'image', 'description'],
                        where: {
                            produit: {
                                [sequelize_1.Op.like]: `%${keyword}%`
                            }
                        }
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
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count: rows.length, list: rows });
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
    searchbycooperative: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { keyword } = req.params;
        const page_number = 1;
        const page_size = 1000;
        try {
            model_hasproducts_1.Hasproducts.belongsTo(model_produits_1.Produits); // , { foreignKey: 'TblEcomProduitId' }
            model_hasproducts_1.Hasproducts.belongsTo(model_unitemesures_1.Unites); // , { foreignKey: 'TblEcomUnitesmesureId' }
            model_hasproducts_1.Hasproducts.belongsTo(model_stocks_1.Stocks); // , { foreignKey: 'TblEcomStockId' }
            model_hasproducts_1.Hasproducts.belongsTo(model_cooperatives_1.Cooperatives); // , { foreignKey: 'TblEcomCooperativeId' }
            const offset = ((page_number) - 1) * (page_size);
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
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'cooperative', 'sigle'],
                        where: {
                            id: parseInt(keyword)
                        }
                    }
                ],
                where: {
                    qte: { [sequelize_1.Op.gte]: 0 }
                }
            })
                .then((rows) => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count: rows.length, list: rows });
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
    searchbyprovince: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { keyword } = req.params;
        const page_number = 1;
        const page_size = 1000;
        try {
            model_hasproducts_1.Hasproducts.belongsTo(model_produits_1.Produits); // , { foreignKey: 'TblEcomProduitId' }
            model_hasproducts_1.Hasproducts.belongsTo(model_unitemesures_1.Unites); // , { foreignKey: 'TblEcomUnitesmesureId' }
            model_hasproducts_1.Hasproducts.belongsTo(model_stocks_1.Stocks); // , { foreignKey: 'TblEcomStockId' }
            model_hasproducts_1.Hasproducts.belongsTo(model_cooperatives_1.Cooperatives); // , { foreignKey: 'TblEcomCooperativeId' }
            const offset = ((page_number) - 1) * (page_size);
            model_hasproducts_1.Hasproducts.findAll({
                // attributes: ['id', 'qte', 'currency'],
                offset: (offset),
                limit: (page_size),
                include: [
                    {
                        model: model_produits_1.Produits,
                        required: true,
                        attributes: ['id', 'produit', 'image', 'description', 'id_category'],
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
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'cooperative', 'sigle', 'id_province'],
                        where: {
                            id_province: parseInt(keyword)
                        }
                    }
                ],
                where: {
                    qte: { [sequelize_1.Op.gte]: 0 }
                }
            })
                .then((rows) => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count: rows.length, list: rows });
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
    searchbycategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { keyword } = req.params;
        const page_number = 1;
        const page_size = 1000;
        try {
            model_hasproducts_1.Hasproducts.belongsTo(model_produits_1.Produits); // , { foreignKey: 'TblEcomProduitId' }
            model_hasproducts_1.Hasproducts.belongsTo(model_unitemesures_1.Unites); // , { foreignKey: 'TblEcomUnitesmesureId' }
            model_hasproducts_1.Hasproducts.belongsTo(model_stocks_1.Stocks); // , { foreignKey: 'TblEcomStockId' }
            model_hasproducts_1.Hasproducts.belongsTo(model_cooperatives_1.Cooperatives); // , { foreignKey: 'TblEcomCooperativeId' }
            const offset = ((page_number) - 1) * (page_size);
            model_hasproducts_1.Hasproducts.findAll({
                // attributes: ['id', 'qte', 'currency'],
                offset: (offset),
                limit: (page_size),
                include: [
                    {
                        model: model_produits_1.Produits,
                        required: true,
                        attributes: ['id', 'produit', 'image', 'description', 'id_category'],
                        where: {
                            id_category: parseInt(keyword)
                        }
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
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'cooperative', 'sigle', 'id_province'],
                    }
                ],
                where: {
                    qte: { [sequelize_1.Op.gte]: 0 }
                }
            })
                .then((rows) => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count: rows.length, list: rows });
            })
                .catch(err => {
                (0, console_1.log)(err);
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, err);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    })
};
