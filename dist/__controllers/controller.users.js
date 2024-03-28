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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__controllerUsers = void 0;
const connecte_1 = require("../__databases/connecte");
const helper_fillphone_1 = require("../__helpers/helper.fillphone");
const model_users_1 = require("../__models/model.users");
const model_hasroles_1 = require("../__models/model.hasroles");
const model_provinces_1 = require("../__models/model.provinces");
const model_roles_1 = require("../__models/model.roles");
const model_territoires_1 = require("../__models/model.territoires");
const model_villages_1 = require("../__models/model.villages");
const sequelize_1 = require("sequelize");
const helper_passwords_1 = require("../__helpers/helper.passwords");
const helper_random_1 = require("../__helpers/helper.random");
const helper_responseserver_1 = require("../__helpers/helper.responseserver");
const enum_httpsstatuscode_1 = require("../__enums/enum.httpsstatuscode");
const middleware_cookies_1 = require("../__middlewares/middleware.cookies");
const helper_all_1 = require("../__helpers/helper.all");
const dotenv_1 = __importDefault(require("dotenv"));
const console_1 = require("console");
const uuid_1 = require("uuid");
const serives_all_1 = require("../__services/serives.all");
const model_extras_1 = require("../__models/model.extras");
const model_hasmembers_1 = require("../__models/model.hasmembers");
dotenv_1.default.config();
const { APP_EXIPRES_IN_ADMIN, APP_EXIPRES_IN_ALL, APP_ESCAPESTRING, APP_NAME } = process.env;
exports.__controllerUsers = {
    signin: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { phone, password } = req.body;
        const role = [1, 3, 2, 4, 5]; // allowed roles to connect 
        try {
            const transaction = yield connecte_1.connect.transaction();
            model_users_1.Users.belongsToMany(model_roles_1.Roles, { through: model_hasroles_1.Hasroles });
            model_roles_1.Roles.belongsToMany(model_users_1.Users, { through: model_hasroles_1.Hasroles });
            model_provinces_1.Provinces.hasOne(model_users_1.Users, { foreignKey: "id" });
            model_users_1.Users.belongsTo(model_provinces_1.Provinces, { foreignKey: "idprovince" });
            model_territoires_1.Territoires.hasOne(model_users_1.Users, { foreignKey: "id" });
            model_users_1.Users.belongsTo(model_territoires_1.Territoires, { foreignKey: "idterritoire" });
            model_villages_1.Villages.hasOne(model_users_1.Users, { foreignKey: "id" });
            model_users_1.Users.belongsTo(model_villages_1.Villages, { foreignKey: "idvillage" });
            model_users_1.Users.findOne({
                where: {
                    [sequelize_1.Op.or]: [
                        { email: phone },
                        { phone: (0, helper_fillphone_1.fillphone)({ phone }) }
                    ]
                },
                include: [
                    {
                        model: model_roles_1.Roles,
                        required: true,
                        attributes: ['id', 'role']
                    },
                    {
                        model: model_provinces_1.Provinces,
                        required: false,
                        attributes: ['id', 'province']
                    },
                    {
                        model: model_territoires_1.Territoires,
                        required: false,
                        attributes: ['id', 'territoire']
                    },
                    {
                        model: model_villages_1.Villages,
                        required: false,
                        attributes: ['id', 'village']
                    }
                ]
            })
                .then(user => {
                if (user instanceof model_users_1.Users) {
                    const { password: aspassword, isvalidated, __tbl_ecom_roles } = user.toJSON();
                    const roles = Array.from(__tbl_ecom_roles).map((role) => role['id']);
                    (0, helper_passwords_1.comparePWD)({
                        hashedtext: aspassword || '',
                        plaintext: password
                    })
                        .then(verified => {
                        if (verified) {
                            if (isvalidated === 1) {
                                if (Array.from(roles).some(r => role.includes(r))) {
                                    middleware_cookies_1.Middleware.onSignin({
                                        expiresIn: APP_EXIPRES_IN_ADMIN || '45m',
                                        data: {
                                            phone: user && user['phone'],
                                            uuid: user && user['uuid'],
                                            __id: user && user['id'],
                                            roles
                                        }
                                    }, (reject, token) => {
                                        if (token) {
                                            // user = formatUserModel({ model: user })
                                            if (user !== null) {
                                                if (user.hasOwnProperty('isvalidated')) {
                                                    delete user['isvalidated'];
                                                }
                                                if (user.hasOwnProperty('password')) {
                                                    delete user['password'];
                                                }
                                            }
                                            transaction.commit();
                                            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { token, user });
                                        }
                                        else {
                                            transaction.rollback();
                                            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Forbidden, "Your refresh token already expired ! you must login to get a new one !");
                                        }
                                    });
                                }
                                else {
                                    transaction.rollback();
                                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Unauthorized, "You dont have right access please contact admin system !");
                                }
                            }
                            else {
                                transaction.rollback();
                                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "Account not validated !");
                            }
                        }
                        else {
                            transaction.rollback();
                            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Forbidden, "Phone | Email or Password incorrect !");
                        }
                    })
                        .catch(err => {
                        transaction.rollback();
                        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Forbidden, "Phone | Email or Password incorrect !");
                    });
                }
                else {
                    transaction.rollback();
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Forbidden, "Phone | Email or Password incorrect !");
                }
            })
                .catch(err => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, err));
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    signup: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { nom, postnom, prenom, email, phone, adresse, idprovince, idterritoire, idvillage, date_naiss, genre, password, avatar } = req.body;
        if (!nom || !postnom || !phone || !password)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least ==> nom & postnom & phone & password");
        const code_ = (0, helper_random_1.randomLongNumber)({ length: 6 });
        const idroles = [5];
        try {
            const pwd = yield (0, helper_passwords_1.hashPWD)({ plaintext: password });
            const transaction = yield connecte_1.connect.transaction();
            const uuid = (0, uuid_1.v4)();
            model_users_1.Users.create({
                uuid,
                nom: (0, helper_all_1.capitalizeWords)({ text: nom }),
                postnom: (0, helper_all_1.capitalizeWords)({ text: postnom }),
                prenom: prenom ? (0, helper_all_1.capitalizeWords)({ text: prenom }) : APP_ESCAPESTRING,
                email: email || (0, helper_fillphone_1.fillphone)({ phone }),
                phone: (0, helper_fillphone_1.fillphone)({ phone }),
                idprovince,
                idterritoire,
                idvillage,
                date_naiss,
                sexe: genre,
                password: pwd
            }, { transaction })
                .then(user => {
                if (user instanceof model_users_1.Users) {
                    user = user.toJSON();
                    delete user['password'];
                    delete user['idprovince'];
                    delete user['idterritoire'];
                    delete user['idvillage'];
                    delete user['isvalidated'];
                    const { id, } = user;
                    serives_all_1.Services.addRoleToUser({
                        inputs: {
                            idroles,
                            iduser: id
                        },
                        transaction,
                        cb: (err, done) => {
                            if (done) {
                                const { code } = done;
                                const { id } = user;
                                if (code === 200) {
                                    model_extras_1.Extras.create({
                                        id_user: id,
                                        verification: code_,
                                    }, { transaction })
                                        .then(extras => {
                                        if (extras instanceof model_extras_1.Extras) {
                                            if (email) {
                                                let chaine = JSON.stringify({
                                                    email: email,
                                                    phone: user['phone'],
                                                });
                                            }
                                            serives_all_1.Services.onSendSMS({
                                                is_flash: false,
                                                to: (0, helper_fillphone_1.fillphone)({ phone }),
                                                content: `Bonjour ${(0, helper_all_1.capitalizeWords)({ text: nom })} votre compte a été crée avec succès. Ceci est votre code de vérirification ${code_}`,
                                            })
                                                .then(suc => {
                                                transaction.commit();
                                                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Created, user);
                                            })
                                                .catch(err => {
                                                transaction.rollback();
                                                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, extras);
                                            });
                                        }
                                        else {
                                            transaction.rollback();
                                            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, extras);
                                        }
                                    })
                                        .catch(er => {
                                        transaction.rollback();
                                        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, er);
                                    });
                                }
                                else {
                                    transaction.rollback();
                                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, "Role not initialized correctly !");
                                }
                            }
                            else {
                                transaction.rollback();
                                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, "Role not initialized correctly !");
                            }
                        }
                    });
                }
                else
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.BadRequest, user);
            })
                .catch(err => {
                transaction.rollback();
                const { name, errors } = err;
                const { message } = errors[0];
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, { name, error: message });
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    auth: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { phone, password } = req.body;
        const role = [1, 3, 2]; // allowed roles to connect 
        try {
            const transaction = yield connecte_1.connect.transaction();
            model_users_1.Users.belongsToMany(model_roles_1.Roles, { through: model_hasroles_1.Hasroles });
            model_roles_1.Roles.belongsToMany(model_users_1.Users, { through: model_hasroles_1.Hasroles });
            model_provinces_1.Provinces.hasOne(model_users_1.Users, { foreignKey: "id" });
            model_users_1.Users.belongsTo(model_provinces_1.Provinces, { foreignKey: "idprovince" });
            model_territoires_1.Territoires.hasOne(model_users_1.Users, { foreignKey: "id" });
            model_users_1.Users.belongsTo(model_territoires_1.Territoires, { foreignKey: "idterritoire" });
            model_villages_1.Villages.hasOne(model_users_1.Users, { foreignKey: "id" });
            model_users_1.Users.belongsTo(model_villages_1.Villages, { foreignKey: "idvillage" });
            model_users_1.Users.findOne({
                where: {
                    [sequelize_1.Op.or]: [
                        { email: phone },
                        { phone: (0, helper_fillphone_1.fillphone)({ phone }) }
                    ]
                },
                include: [
                    {
                        model: model_roles_1.Roles,
                        required: true,
                        attributes: ['id', 'role']
                    },
                    {
                        model: model_provinces_1.Provinces,
                        required: false,
                        attributes: ['id', 'province']
                    },
                    {
                        model: model_territoires_1.Territoires,
                        required: false,
                        attributes: ['id', 'territoire']
                    },
                    {
                        model: model_villages_1.Villages,
                        required: false,
                        attributes: ['id', 'village']
                    }
                ]
            })
                .then(user => {
                if (user instanceof model_users_1.Users) {
                    const { password: aspassword, isvalidated, __tbl_ecom_roles } = user.toJSON();
                    const roles = Array.from(__tbl_ecom_roles).map((role) => role['id']);
                    (0, helper_passwords_1.comparePWD)({
                        hashedtext: aspassword || '',
                        plaintext: password
                    })
                        .then(verified => {
                        if (verified) {
                            if (isvalidated === 1) {
                                if (Array.from(roles).some(r => role.includes(r))) {
                                    middleware_cookies_1.Middleware.onSignin({
                                        expiresIn: APP_EXIPRES_IN_ADMIN || '45m',
                                        data: {
                                            phone: user && user['phone'],
                                            uuid: user && user['uuid'],
                                            __id: user && user['id'],
                                            roles
                                        }
                                    }, (reject, token) => {
                                        if (token) {
                                            // user = formatUserModel({ model: user })
                                            if (user !== null) {
                                                if (user.hasOwnProperty('isvalidated')) {
                                                    delete user['isvalidated'];
                                                }
                                                if (user.hasOwnProperty('password')) {
                                                    delete user['password'];
                                                }
                                            }
                                            transaction.commit();
                                            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { token, user });
                                        }
                                        else {
                                            transaction.rollback();
                                            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Forbidden, "Your refresh token already expired ! you must login to get a new one !");
                                        }
                                    });
                                }
                                else {
                                    transaction.rollback();
                                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Unauthorized, "You dont have right access please contact admin system !");
                                }
                            }
                            else {
                                transaction.rollback();
                                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "Account not validated !");
                            }
                        }
                        else {
                            transaction.rollback();
                            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Forbidden, "Phone | Email or Password incorrect !");
                        }
                    })
                        .catch(err => {
                        transaction.rollback();
                        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Forbidden, "Phone | Email or Password incorrect !");
                    });
                }
                else {
                    transaction.rollback();
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Forbidden, "Phone | Email or Password incorrect !");
                }
            })
                .catch(err => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, err));
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    register: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { nom, postnom, prenom, email, phone, adresse, idprovince, idterritoire, idvillage, date_naiss, genre, password, avatar, idroles } = req.body;
        try {
            const pwd = yield (0, helper_passwords_1.hashPWD)({ plaintext: password });
            const transaction = yield connecte_1.connect.transaction();
            const uuid = (0, uuid_1.v4)();
            model_users_1.Users.create({
                uuid,
                nom: (0, helper_all_1.capitalizeWords)({ text: nom }),
                postnom: (0, helper_all_1.capitalizeWords)({ text: postnom }),
                prenom: prenom ? (0, helper_all_1.capitalizeWords)({ text: prenom }) : APP_ESCAPESTRING,
                email: email || (0, helper_fillphone_1.fillphone)({ phone }),
                phone: (0, helper_fillphone_1.fillphone)({ phone }),
                idprovince,
                idterritoire,
                idvillage,
                date_naiss,
                sexe: genre,
                password: pwd,
                isvalidated: 1
            }, { transaction })
                .then(user => {
                if (user instanceof model_users_1.Users) {
                    user = user.toJSON();
                    delete user['password'];
                    delete user['idprovince'];
                    delete user['idterritoire'];
                    delete user['idvillage'];
                    delete user['isvalidated'];
                    const { id, } = user;
                    serives_all_1.Services.addRoleToUser({
                        inputs: {
                            idroles,
                            iduser: id
                        },
                        transaction,
                        cb: (err, done) => __awaiter(void 0, void 0, void 0, function* () {
                            if (done) {
                                const { code } = done;
                                if (code === 200) {
                                    if (email) {
                                        let chaine = JSON.stringify({
                                            email: email,
                                            phone: user['phone'],
                                        });
                                    }
                                    yield serives_all_1.Services.onSendSMS({
                                        is_flash: false,
                                        to: (0, helper_fillphone_1.fillphone)({ phone }),
                                        content: `Bonjour ${(0, helper_all_1.capitalizeWords)({ text: nom })} votre compte a été crée avec succès. Ceci est votre mot de passe ${password}`,
                                    }).then(sms => {
                                        transaction.commit();
                                        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Created, user);
                                    })
                                        .catch(er => {
                                        transaction.rollback();
                                        (0, console_1.log)(er);
                                        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, "Role not initialized correctly !");
                                    });
                                }
                                else {
                                    transaction.rollback();
                                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, "Role not initialized correctly !");
                                }
                            }
                            else {
                                transaction.rollback();
                                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, "Role not initialized correctly !");
                            }
                        })
                    });
                }
                else
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.BadRequest, user);
            })
                .catch(err => {
                transaction.rollback();
                const { name, errors } = err;
                const { message } = errors[0];
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, { name, error: message });
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    validate: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let { iduser } = req.params;
        if (!iduser)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least iduser as paramter !");
        try {
            const transaction = yield connecte_1.connect.transaction();
            model_users_1.Users.belongsToMany(model_roles_1.Roles, { through: model_hasroles_1.Hasroles });
            model_roles_1.Roles.belongsToMany(model_users_1.Users, { through: model_hasroles_1.Hasroles });
            model_provinces_1.Provinces.hasOne(model_users_1.Users, { foreignKey: "id" });
            model_users_1.Users.belongsTo(model_provinces_1.Provinces, { foreignKey: "idprovince" });
            model_territoires_1.Territoires.hasOne(model_users_1.Users, { foreignKey: "id" });
            model_users_1.Users.belongsTo(model_territoires_1.Territoires, { foreignKey: "idterritoire" });
            model_villages_1.Villages.hasOne(model_users_1.Users, { foreignKey: "id" });
            model_users_1.Users.belongsTo(model_villages_1.Villages, { foreignKey: "idvillage" });
            model_users_1.Users.findOne({
                where: {
                    [sequelize_1.Op.or]: [
                        { id: parseInt(iduser) },
                        { uuid: iduser }
                    ]
                },
                attributes: {
                    exclude: ['password', 'isvalidated', 'idprovince', 'idterritoire', 'idvillage']
                },
                include: [
                    {
                        model: model_roles_1.Roles,
                        required: true,
                        attributes: ['id', 'role']
                    },
                    {
                        model: model_provinces_1.Provinces,
                        required: false,
                        attributes: ['id', 'province']
                    },
                    {
                        model: model_territoires_1.Territoires,
                        required: false,
                        attributes: ['id', 'territoire']
                    },
                    {
                        model: model_villages_1.Villages,
                        required: false,
                        attributes: ['id', 'village']
                    }
                ]
            })
                .then(user => {
                if (user instanceof model_users_1.Users) {
                    const { password: aspassword, isvalidated, phone, date_naiss, nom } = user === null || user === void 0 ? void 0 : user.toJSON();
                    if (isvalidated !== 1) {
                        user.update({
                            isvalidated: 1
                        })
                            .then(U => {
                            serives_all_1.Services.onSendSMS({
                                to: (0, helper_fillphone_1.fillphone)({ phone }),
                                content: `Bonjour ${(0, helper_all_1.capitalizeWords)({ text: nom })} votre compte a été validé avec succès; vous pouvez maintenant acceder à la plateforme de ${APP_NAME}`,
                                is_flash: false
                            });
                            transaction.commit();
                            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, user);
                        });
                    }
                    else {
                        transaction.rollback();
                        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, "Account is still validated !");
                    }
                }
                else {
                    transaction.rollback();
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotFound, "User not found in the list of users !");
                }
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    profile: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let { iduser } = req.params;
        if (!iduser)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least iduser as paramter !");
        try {
            const transaction = yield connecte_1.connect.transaction();
            model_users_1.Users.belongsToMany(model_roles_1.Roles, { through: model_hasroles_1.Hasroles });
            model_roles_1.Roles.belongsToMany(model_users_1.Users, { through: model_hasroles_1.Hasroles });
            model_provinces_1.Provinces.hasOne(model_users_1.Users, { foreignKey: "id" });
            model_users_1.Users.belongsTo(model_provinces_1.Provinces, { foreignKey: "idprovince" });
            model_territoires_1.Territoires.hasOne(model_users_1.Users, { foreignKey: "id" });
            model_users_1.Users.belongsTo(model_territoires_1.Territoires, { foreignKey: "idterritoire" });
            model_villages_1.Villages.hasOne(model_users_1.Users, { foreignKey: "id" });
            model_users_1.Users.belongsTo(model_villages_1.Villages, { foreignKey: "idvillage" });
            model_users_1.Users.findOne({
                where: {
                    [sequelize_1.Op.or]: [
                        { id: parseInt(iduser) },
                        { uuid: iduser }
                    ]
                },
                attributes: {
                    exclude: ['password', 'isvalidated', 'idprovince', 'idterritoire', 'idvillage']
                },
                include: [
                    {
                        model: model_roles_1.Roles,
                        required: true,
                        attributes: ['id', 'role']
                    },
                    {
                        model: model_provinces_1.Provinces,
                        required: false,
                        attributes: ['id', 'province']
                    },
                    {
                        model: model_territoires_1.Territoires,
                        required: false,
                        attributes: ['id', 'territoire']
                    },
                    {
                        model: model_villages_1.Villages,
                        required: false,
                        attributes: ['id', 'village']
                    }
                ]
            })
                .then(user => {
                if (user instanceof model_users_1.Users) {
                    const { password: aspassword, isvalidated, phone, date_naiss, nom } = user === null || user === void 0 ? void 0 : user.toJSON();
                    if (isvalidated !== 1) {
                        transaction.commit();
                        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, user);
                    }
                    else {
                        transaction.rollback();
                        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotFound, {});
                    }
                }
                else {
                    transaction.rollback();
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotFound, "User not found in the list of users !");
                }
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    list: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const transaction = yield connecte_1.connect.transaction();
            model_users_1.Users.belongsToMany(model_roles_1.Roles, { through: model_hasroles_1.Hasroles });
            model_roles_1.Roles.belongsToMany(model_users_1.Users, { through: model_hasroles_1.Hasroles });
            model_provinces_1.Provinces.hasOne(model_users_1.Users, { foreignKey: "id" });
            model_users_1.Users.belongsTo(model_provinces_1.Provinces, { foreignKey: "idprovince" });
            model_territoires_1.Territoires.hasOne(model_users_1.Users, { foreignKey: "id" });
            model_users_1.Users.belongsTo(model_territoires_1.Territoires, { foreignKey: "idterritoire" });
            model_villages_1.Villages.hasOne(model_users_1.Users, { foreignKey: "id" });
            model_users_1.Users.belongsTo(model_villages_1.Villages, { foreignKey: "idvillage" });
            model_users_1.Users.findAndCountAll({
                where: {
                    isvalidated: 1
                },
                attributes: {
                    exclude: ['password', 'isvalidated', 'idprovince', 'idterritoire', 'idvillage']
                },
                include: [
                    {
                        model: model_roles_1.Roles,
                        required: true,
                        attributes: ['id', 'role'],
                    },
                    {
                        model: model_provinces_1.Provinces,
                        required: false,
                        attributes: ['id', 'province']
                    },
                    {
                        model: model_territoires_1.Territoires,
                        required: false,
                        attributes: ['id', 'territoire']
                    },
                    {
                        model: model_villages_1.Villages,
                        required: false,
                        attributes: ['id', 'village']
                    }
                ]
            })
                .then(user => {
                transaction.commit();
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, Object.assign({}, user));
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    listbyrole: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { idrole } = req.params;
        if (!idrole)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "THis request must have at least idrole as param !");
        try {
            const transaction = yield connecte_1.connect.transaction();
            model_users_1.Users.belongsToMany(model_roles_1.Roles, { through: model_hasroles_1.Hasroles });
            model_roles_1.Roles.belongsToMany(model_users_1.Users, { through: model_hasroles_1.Hasroles });
            model_provinces_1.Provinces.hasOne(model_users_1.Users, { foreignKey: "id" });
            model_users_1.Users.belongsTo(model_provinces_1.Provinces, { foreignKey: "idprovince" });
            model_territoires_1.Territoires.hasOne(model_users_1.Users, { foreignKey: "id" });
            model_users_1.Users.belongsTo(model_territoires_1.Territoires, { foreignKey: "idterritoire" });
            model_villages_1.Villages.hasOne(model_users_1.Users, { foreignKey: "id" });
            model_users_1.Users.belongsTo(model_villages_1.Villages, { foreignKey: "idvillage" });
            model_users_1.Users.findAndCountAll({
                where: {
                    isvalidated: 1
                },
                attributes: {
                    exclude: ['password', 'isvalidated', 'idprovince', 'idterritoire', 'idvillage']
                },
                include: [
                    {
                        model: model_roles_1.Roles,
                        required: true,
                        attributes: ['id', 'role'],
                        where: {
                            id: parseInt(idrole)
                        }
                    },
                    {
                        model: model_provinces_1.Provinces,
                        required: false,
                        attributes: ['id', 'province']
                    },
                    {
                        model: model_territoires_1.Territoires,
                        required: false,
                        attributes: ['id', 'territoire']
                    },
                    {
                        model: model_villages_1.Villages,
                        required: false,
                        attributes: ['id', 'village']
                    }
                ]
            })
                .then(user => {
                transaction.commit();
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, Object.assign({}, user));
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    verify: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id_user, verification_code } = req.body;
        if (!id_user || !verification_code)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least !id_user || !verification_code");
        try {
            model_users_1.Users.hasOne(model_extras_1.Extras, { foreignKey: "id_user" });
            model_users_1.Users.findOne({
                include: [
                    {
                        model: model_extras_1.Extras,
                        required: true
                    }
                ],
                attributes: {
                    exclude: ['password']
                },
                where: {
                    [sequelize_1.Op.or]: [
                        { id: parseInt(id_user) },
                        { phone: (0, helper_fillphone_1.fillphone)({ phone: id_user }) },
                        { uuid: id_user }
                    ]
                }
            })
                .then(user => {
                if (user instanceof model_users_1.Users) {
                    const { isvalidated, __tbl_ecom_extra } = user.toJSON();
                    if (isvalidated === 0) {
                        const { verification } = __tbl_ecom_extra;
                        if (String(verification_code).trim() === String(verification).toString()) {
                            user.update({
                                isvalidated: 1
                            })
                                .then(U => {
                                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, user);
                            })
                                .catch(Err => {
                                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.BadRequest, Err);
                            });
                        }
                        else {
                            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Forbidden, `Wrong code was used --- ${verification_code}`);
                        }
                    }
                    else {
                        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, "User is still verified !");
                    }
                }
                else {
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotFound, "Record not found in Users ---list");
                }
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    resendcode: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id_user, verification_code } = req.body;
        if (!id_user)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least !id_user");
        try {
            model_users_1.Users.hasOne(model_extras_1.Extras, { foreignKey: "id_user" });
            model_users_1.Users.findOne({
                include: [
                    {
                        model: model_extras_1.Extras,
                        required: true
                    }
                ],
                attributes: {
                    exclude: ['password']
                },
                where: {
                    [sequelize_1.Op.or]: [
                        { id: parseInt(id_user) },
                        { phone: (0, helper_fillphone_1.fillphone)({ phone: id_user }) },
                        { uuid: id_user }
                    ]
                }
            })
                .then(user => {
                if (user instanceof model_users_1.Users) {
                    const { isvalidated, __tbl_ecom_extra, phone, nom } = user.toJSON();
                    if (isvalidated === 0) {
                        const { verification } = __tbl_ecom_extra;
                        const code_ = verification || (0, helper_random_1.randomLongNumber)({ length: 6 });
                        serives_all_1.Services.onSendSMS({
                            is_flash: false,
                            to: (0, helper_fillphone_1.fillphone)({ phone }),
                            content: `Bonjour ${(0, helper_all_1.capitalizeWords)({ text: nom })} votre compte a été crée avec succès. Ceci est votre code de vérirification ${code_}`,
                        })
                            .then(suc => {
                            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, `New Verification code was sent to ${phone} user`);
                        })
                            .catch(err => {
                            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err);
                        });
                    }
                    else {
                        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, "User is still verified !");
                    }
                }
                else {
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotFound, "Record not found in Users ---list");
                }
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    update: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { iduser } = req.params;
        if (!iduser)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least iduser as param !");
        if (Object.keys(req.body).length > 0)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "The should not be empty");
        try {
            model_users_1.Users.update(Object.assign({}, req.body), {
                where: {
                    id: parseInt(iduser)
                }
            })
                .then(U => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, U);
            })
                .catch(err => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err));
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    delete: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { iduser } = req.params;
        const transaction = null; //await connect.transaction();
        try {
            const user = yield model_users_1.Users.findOne({
                where: {
                    id: parseInt(iduser)
                },
                transaction
            });
            if (user instanceof model_users_1.Users) {
                const { id } = user.toJSON();
                yield model_hasroles_1.Hasroles.destroy({
                    transaction,
                    where: {
                        TblEcomUserId: id
                    }
                })
                    .then(D => {
                    model_hasmembers_1.Hasmembers.destroy({
                        transaction,
                        where: {
                            TblEcomUserId: id
                        }
                    })
                        .then(DD => {
                        model_extras_1.Extras.destroy({
                            transaction,
                            where: {
                                id_user: id
                            }
                        })
                            .then(DDD => {
                            user.destroy()
                                .then(DDDD => {
                                // transaction.commit()
                                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, `The user with id ${iduser} was successfuly deleted`);
                            });
                        })
                            .catch(Err => {
                            // transaction.rollback()
                            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, Err);
                        });
                    })
                        .catch(Err => {
                        // transaction.rollback()
                        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, Err);
                    });
                })
                    .catch(Err => {
                    // transaction.rollback()
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, Err);
                });
            }
            else {
                // transaction.rollback()
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotFound, `The user with id ${iduser} not found in the table user !`);
            }
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    })
};
