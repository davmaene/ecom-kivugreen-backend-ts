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
const model_typelivraison_1 = require("../__models/model.typelivraison");
const sequelize_1 = require("sequelize");
const console_1 = require("console");
const model_unitemesures_1 = require("../__models/model.unitemesures");
const model_users_1 = require("../__models/model.users");
const helper_all_1 = require("../__helpers/helper.all");
const model_codelivraison_1 = require("../__models/model.codelivraison");
const helper_random_1 = require("../__helpers/helper.random");
const serives_all_1 = require("../__services/serives.all");
exports.__controllerCommandes = {
    listcommandebytransaction: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { currentuser } = req;
        const { idtransaction } = req.params;
        const { __id, roles, uuid } = currentuser;
        try {
            model_commandes_1.Commandes.belongsTo(model_produits_1.Produits, { foreignKey: "id_produit" });
            model_commandes_1.Commandes.belongsTo(model_typelivraison_1.Typelivraisons, { foreignKey: "type_livraison" });
            model_commandes_1.Commandes.findAll({
                order: [
                    ['id', 'DESC']
                ],
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
                    transaction: idtransaction
                }
            })
                .then(commandes => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count: commandes.length, rows: commandes });
            })
                .catch(err => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    listcommandebycooperative: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { idcooperative: idtransaction } = req.params;
        const { currentuser } = req;
        const { __id, roles, uuid } = currentuser;
        try {
            model_commandes_1.Commandes.belongsTo(model_produits_1.Produits, { foreignKey: "id_produit" });
            model_commandes_1.Commandes.belongsTo(model_typelivraison_1.Typelivraisons, { foreignKey: "type_livraison" });
            model_commandes_1.Commandes.belongsTo(model_unitemesures_1.Unites, { foreignKey: "id_unity" });
            model_commandes_1.Commandes.belongsTo(model_users_1.Users, { foreignKey: "createdby" });
            model_commandes_1.Commandes.findAll({
                order: [
                    ['id', 'DESC']
                ],
                include: [
                    {
                        model: model_produits_1.Produits,
                        required: true,
                    },
                    {
                        model: model_users_1.Users,
                        required: true,
                        attributes: ['id', 'nom', 'postnom', 'prenom', 'phone', 'email', 'sexe']
                    },
                    {
                        model: model_unitemesures_1.Unites,
                        required: true,
                    },
                    {
                        model: model_typelivraison_1.Typelivraisons,
                        required: true,
                    }
                ],
                where: {
                    id_cooperative: idtransaction
                }
            })
                .then(commandes => {
                const groupes = (0, helper_all_1.groupedDataByColumn)({ column: "transaction", data: commandes });
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count: commandes.length, rows: commandes, groupes });
            })
                .catch(err => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    listcommandebycooperativeandstate: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { currentuser } = req;
        const { idcooperative: idtransaction, state } = req.params;
        const { __id, roles, uuid } = currentuser;
        try {
            model_commandes_1.Commandes.belongsTo(model_produits_1.Produits, { foreignKey: "id_produit" });
            model_commandes_1.Commandes.belongsTo(model_typelivraison_1.Typelivraisons, { foreignKey: "type_livraison" });
            model_commandes_1.Commandes.belongsTo(model_unitemesures_1.Unites, { foreignKey: "id_unity" });
            model_commandes_1.Commandes.belongsTo(model_users_1.Users, { foreignKey: "createdby" });
            model_commandes_1.Commandes.findAll({
                order: [
                    ['id', 'DESC']
                ],
                include: [
                    {
                        model: model_produits_1.Produits,
                        required: true,
                    },
                    {
                        model: model_users_1.Users,
                        required: true,
                        attributes: ['id', 'nom', 'postnom', 'prenom', 'phone', 'email', 'sexe']
                    },
                    {
                        model: model_unitemesures_1.Unites,
                        required: true,
                    },
                    {
                        model: model_typelivraison_1.Typelivraisons,
                        required: true,
                    }
                ],
                where: {
                    state: parseInt(state),
                    id_cooperative: idtransaction
                }
            })
                .then(commandes => {
                const groupes = (0, helper_all_1.groupedDataByColumn)({ column: "transaction", data: commandes });
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count: commandes.length, rows: commandes, groupes });
            })
                .catch(err => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    listtransaction: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { currentuser } = req;
        const { __id, roles, uuid } = currentuser;
        try {
            model_commandes_1.Commandes.findAll({
                order: [
                    ['id', 'DESC']
                ],
                attributes: [
                    [sequelize_1.Sequelize.fn('LEFT', sequelize_1.Sequelize.col('transaction'), 30), 'transaction'],
                ],
                group: ['transaction'],
                where: {
                    createdby: __id
                }
            })
                .then(commandes => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count: commandes.length, rows: commandes });
            })
                .catch(err => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    list: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            model_commandes_1.Commandes.belongsTo(model_produits_1.Produits, { foreignKey: "id_produit" });
            model_commandes_1.Commandes.belongsTo(model_typelivraison_1.Typelivraisons, { foreignKey: "type_livraison" });
            model_commandes_1.Commandes.belongsTo(model_unitemesures_1.Unites, { foreignKey: "id_unity" });
            model_commandes_1.Commandes.belongsTo(model_users_1.Users, { foreignKey: "createdby" });
            model_commandes_1.Commandes.findAll({
                order: [
                    ['id', 'DESC']
                ],
                include: [
                    {
                        model: model_produits_1.Produits,
                        required: true,
                    },
                    {
                        model: model_typelivraison_1.Typelivraisons,
                        required: true,
                    },
                    {
                        model: model_unitemesures_1.Unites,
                        required: true,
                    },
                    {
                        model: model_users_1.Users,
                        required: true,
                    }
                ],
                where: {}
            })
                .then(commandes => {
                const groupes = (0, helper_all_1.groupedDataByColumn)({ column: "transaction", data: commandes });
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count: commandes.length, rows: commandes, groupes });
            })
                .catch(err => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    listbyowner: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { currentuser } = req;
        const { __id, roles, uuid } = currentuser;
        try {
            model_commandes_1.Commandes.belongsTo(model_produits_1.Produits, { foreignKey: "id_produit" });
            model_commandes_1.Commandes.belongsTo(model_typelivraison_1.Typelivraisons, { foreignKey: "type_livraison" });
            model_commandes_1.Commandes.belongsTo(model_unitemesures_1.Unites, { foreignKey: "id_unity" });
            model_commandes_1.Commandes.belongsTo(model_users_1.Users, { foreignKey: "createdby" });
            model_commandes_1.Commandes.findAll({
                order: [
                    ['id', 'DESC']
                ],
                include: [
                    {
                        model: model_produits_1.Produits,
                        required: true,
                    },
                    {
                        model: model_typelivraison_1.Typelivraisons,
                        required: true,
                    },
                    {
                        model: model_unitemesures_1.Unites,
                        required: true,
                    },
                    {
                        model: model_users_1.Users,
                        required: true,
                    }
                ],
                where: {
                    createdby: __id
                }
            })
                .then(commandes => {
                const groupes = (0, helper_all_1.groupedDataByColumn)({ column: "transaction", data: commandes });
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count: commandes.length, rows: commandes, groupes });
            })
                .catch(err => {
                (0, console_1.log)(err);
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    listbystate: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { status } = req.params;
        if (!status)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "this request must have at least status in the request !");
        try {
            model_commandes_1.Commandes.belongsTo(model_produits_1.Produits, { foreignKey: "id_produit" });
            model_commandes_1.Commandes.belongsTo(model_typelivraison_1.Typelivraisons, { foreignKey: "type_livraison" });
            model_commandes_1.Commandes.belongsTo(model_unitemesures_1.Unites, { foreignKey: "id_unity" });
            model_commandes_1.Commandes.belongsTo(model_users_1.Users, { foreignKey: "createdby" });
            model_commandes_1.Commandes.findAll({
                order: [
                    ['id', 'DESC']
                ],
                include: [
                    {
                        model: model_produits_1.Produits,
                        required: true,
                    },
                    {
                        model: model_typelivraison_1.Typelivraisons,
                        required: true,
                    },
                    {
                        model: model_unitemesures_1.Unites,
                        required: true,
                    },
                    {
                        model: model_users_1.Users,
                        required: true,
                    }
                ],
                where: {
                    state: parseInt(status)
                }
            })
                .then(commandes => {
                const groupes = (0, helper_all_1.groupedDataByColumn)({ column: "transaction", data: commandes });
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count: commandes.length, rows: commandes, groupes });
            })
                .catch(err => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    listbystateanddeliver: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { status } = req.params;
        const { currentuser } = req;
        const { __id, roles, uuid } = currentuser;
        if (!status)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "this request must have at least status in the request !");
        (0, console_1.log)("=================> ", __id, status);
        try {
            model_commandes_1.Commandes.belongsTo(model_produits_1.Produits, { foreignKey: "id_produit" });
            model_commandes_1.Commandes.belongsTo(model_typelivraison_1.Typelivraisons, { foreignKey: "type_livraison" });
            model_commandes_1.Commandes.belongsTo(model_unitemesures_1.Unites, { foreignKey: "id_unity" });
            model_commandes_1.Commandes.belongsTo(model_users_1.Users, { foreignKey: "createdby" });
            model_commandes_1.Commandes.findAll({
                order: [
                    ['id', 'DESC']
                ],
                include: [
                    {
                        model: model_produits_1.Produits,
                        required: true,
                    },
                    {
                        model: model_typelivraison_1.Typelivraisons,
                        required: true,
                    },
                    {
                        model: model_unitemesures_1.Unites,
                        required: true,
                    },
                    {
                        model: model_users_1.Users,
                        required: true,
                    }
                ],
                where: {
                    updatedby: __id,
                    state: parseInt(status)
                }
            })
                .then(commandes => {
                const groupes = (0, helper_all_1.groupedDataByColumn)({ column: "transaction", data: commandes });
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count: commandes.length, rows: commandes, groupes });
            })
                .catch(err => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    beforevalidation: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id_transaction, id_livreur, id_customer } = req.body;
        if (!id_transaction || !id_livreur)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least !code_livraison || !id_transaction || !id_livreur");
        try {
            const code_livraison = (0, helper_random_1.randomLongNumber)({ length: 6 });
            const customer = yield model_users_1.Users.findOne({ where: { id: id_customer } });
            if (customer instanceof model_users_1.Users) {
                const { phone, nom, postnom, email } = customer.toJSON();
                model_codelivraison_1.Codelivraisons.findOrCreate({
                    defaults: {
                        code_livraison,
                        id_transaction,
                        description: JSON.stringify(req.body),
                        id_customer,
                        id_livreur
                    },
                    where: {
                        id_transaction
                    }
                })
                    .then(([cd, isnew]) => {
                    if (cd instanceof model_codelivraison_1.Codelivraisons) {
                        if (!isnew) {
                            cd.update({
                                code_livraison
                            });
                        }
                        serives_all_1.Services.onSendSMS({
                            to: phone,
                            is_flash: false,
                            content: `KG-${code_livraison} \nBonjour ${nom} ceci est votre de confirmation de livraison, ne le partagez qu'avec votre livreur !`
                        })
                            .then(_ => { })
                            .catch(_ => { });
                        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, cd);
                    }
                    else {
                        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, cd);
                    }
                })
                    .catch(err => {
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err);
                });
            }
            else {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, "This request must have at least ::Customer");
            }
        }
        catch (error) {
            (0, console_1.log)(error, id_customer, id_livreur, id_transaction);
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    validate: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { idcommande } = req.params;
        if (!idcommande)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "this request must have at least idcommande in the request !");
        const { id_transaction, id_livreur, code_livraison, id_customer } = req.body;
        if (!id_transaction || !id_livreur || !code_livraison)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least !id_transaction || !id_livreur || !code_livraison");
        const customer = yield model_users_1.Users.findOne({ where: { id: id_customer } });
        const cmd = yield model_commandes_1.Commandes.findOne({
            where: {
                transaction: (id_transaction),
                state: 2
            }
        });
        try {
            if (cmd instanceof model_commandes_1.Commandes && customer instanceof model_users_1.Users) {
                model_codelivraison_1.Codelivraisons.findOne({
                    where: {
                        id_transaction,
                    }
                })
                    .then(cd => {
                    if (cd instanceof model_codelivraison_1.Codelivraisons) {
                    }
                    else {
                        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.BadRequest, cd);
                    }
                })
                    .catch(err => {
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err);
                });
            }
            else {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotFound, cmd);
            }
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    changestate: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { idcommande: transaction } = req.params;
        const { currentuser } = req;
        const { __id, roles, uuid } = currentuser;
        if (!transaction)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "this request must have at least idcommande in the request !");
        try {
            model_commandes_1.Commandes.belongsTo(model_produits_1.Produits, { foreignKey: "id_produit" });
            model_commandes_1.Commandes.belongsTo(model_typelivraison_1.Typelivraisons, { foreignKey: "type_livraison" });
            model_commandes_1.Commandes.findAll({
                include: [
                    {
                        model: model_produits_1.Produits,
                        required: false,
                    },
                    {
                        model: model_produits_1.Produits,
                        required: false,
                    }
                ],
                where: {
                    transaction,
                    state: 3, // 3: livrable, payed and can be livrable
                }
            })
                .then(commandes => {
                if (commandes && commandes.length > 0) {
                    model_commandes_1.Commandes.update({
                        state: 2,
                        updatedby: __id
                    }, {
                        where: {
                            transaction
                        }
                    });
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, commandes);
                }
                else {
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.BadRequest, {});
                }
            })
                .catch(err => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    })
};
