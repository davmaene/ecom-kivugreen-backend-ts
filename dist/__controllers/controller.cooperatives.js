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
exports.__controllerCooperatives = void 0;
const model_cooperatives_1 = require("../__models/model.cooperatives");
const enum_httpsstatuscode_1 = require("../__enums/enum.httpsstatuscode");
const helper_responseserver_1 = require("../__helpers/helper.responseserver");
const serives_all_1 = require("../__services/serives.all");
const console_1 = require("console");
const model_users_1 = require("../__models/model.users");
const model_hasmembers_1 = require("../__models/model.hasmembers");
const helper_random_1 = require("../__helpers/helper.random");
const helper_fillphone_1 = require("../__helpers/helper.fillphone");
const helper_moment_1 = require("../__helpers/helper.moment");
const model_provinces_1 = require("../__models/model.provinces");
const model_territoires_1 = require("../__models/model.territoires");
const services_images_1 = require("../__services/services.images");
const helper_all_1 = require("../__helpers/helper.all");
exports.__controllerCooperatives = {
    list: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            model_users_1.Users.belongsToMany(model_cooperatives_1.Cooperatives, { through: model_hasmembers_1.Hasmembers });
            model_cooperatives_1.Cooperatives.belongsToMany(model_users_1.Users, { through: model_hasmembers_1.Hasmembers });
            model_cooperatives_1.Cooperatives.findAndCountAll({
                where: {},
                include: [
                    {
                        model: model_users_1.Users,
                        required: false,
                        attributes: ['id', 'nom', 'postnom', 'prenom', 'phone', 'email']
                        // isAliased: false,
                        // as: "resposable"
                    }
                ]
            })
                .then(({ rows, count }) => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, { count, rows });
            })
                .catch(err => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, err);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    getonebyid: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { idcooperative } = req.params;
        try {
            model_users_1.Users.belongsToMany(model_cooperatives_1.Cooperatives, { through: model_hasmembers_1.Hasmembers });
            model_cooperatives_1.Cooperatives.belongsToMany(model_users_1.Users, { through: model_hasmembers_1.Hasmembers });
            model_cooperatives_1.Cooperatives.belongsTo(model_provinces_1.Provinces, { foreignKey: "id_province" });
            model_cooperatives_1.Cooperatives.belongsTo(model_territoires_1.Territoires, { foreignKey: "id_territoire" });
            model_cooperatives_1.Cooperatives.findOne({
                where: {
                    id: idcooperative
                },
                include: [
                    {
                        model: model_provinces_1.Provinces,
                        required: false,
                        // attributes: ['id', 'nom', 'postnom', 'prenom', 'phone', 'email']
                    },
                    {
                        model: model_territoires_1.Territoires,
                        required: false,
                        // attributes: ['id', 'nom', 'postnom', 'prenom', 'phone', 'email']
                    },
                    {
                        model: model_users_1.Users,
                        required: false,
                        attributes: ['id', 'nom', 'postnom', 'prenom', 'phone', 'email']
                    }
                ]
            })
                .then((row) => {
                if (row instanceof model_cooperatives_1.Cooperatives) {
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, row);
                }
                else {
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotFound, row);
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
    add: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { isformel } = req.body;
        if (!req.files)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, `This request must have at least req.files !`);
        const { logo, file } = req.files;
        let payload = Object.assign({}, req.body);
        try {
            if (parseInt(isformel) === 1) {
                if (!req.files)
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "Please upload a attached file for this cooperative !");
                if (!file)
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "Please provide the file cause this is formel cooperative");
                const { mimetype } = req['files']['file'];
                const type = (0, helper_all_1.checkFileType)({ as: 'doc', mimetype });
                if (!type)
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "Please provide the cooperative's logo as image file");
                const { code, message, data } = yield serives_all_1.Services.uploadfile({
                    inputs: {
                        file: req,
                        saveas: 'as_docs',
                        type: 'file'
                    }
                });
                if (code === 200) {
                    const { filename, fullpath } = data;
                    payload['file'] = fullpath;
                }
                else {
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "The file was not successfuly uploaded, Error on uploading the file !");
                }
            }
            payload['isformel'] = parseInt(payload['isformel']);
            payload['id_category'] = parseInt(payload['id_category']);
            payload['id_responsable'] = parseInt(payload['id_responsable']);
            payload['id_adjoint'] = parseInt(payload['id_adjoint']);
            payload['id_territoire'] = parseInt(payload['id_territoire']);
            if (!logo)
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "Please provide the cooperative's logo as image file");
            const { mimetype } = req['files']['logo'];
            const type = (0, helper_all_1.checkFileType)({ as: 'img', mimetype });
            if (!type)
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "Please provide the cooperative's logo as image file");
            services_images_1.ServiceImage.onUploadImage({
                inputs: {
                    file: req,
                    saveas: 'as_image',
                    type: 'logo'
                },
                callBack: (err, done) => {
                    if (done) {
                        const { code, message, data } = done;
                        if (code === 200) {
                            const { fullpath, filename } = data;
                            model_cooperatives_1.Cooperatives.create(Object.assign(Object.assign({}, payload), { num_enregistrement: (0, helper_random_1.randomLongNumber)({ length: 12 }), logo: fullpath }))
                                .then(coopec => {
                                if (coopec instanceof model_cooperatives_1.Cooperatives)
                                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, coopec);
                                else
                                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, coopec);
                            })
                                .catch(err => {
                                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, err);
                            });
                        }
                        else {
                            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Conflict, err);
                        }
                    }
                    else {
                        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err);
                    }
                }
            });
        }
        catch (error) {
            (0, console_1.log)(error);
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    addmemebers: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { ids_members, id_cooperative } = req.body;
        if (!ids_members || !id_cooperative)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least ids_members and id_cooperative !");
        try {
            const coopec = yield model_cooperatives_1.Cooperatives.findOne({
                where: {
                    id: id_cooperative
                }
            });
            if (coopec instanceof model_cooperatives_1.Cooperatives) {
                const { adresse, cooperative, num_enregistrement } = coopec.toJSON();
                const treated = [];
                for (let index = 0; index < Array.from(ids_members).length; index++) {
                    const id_membre = ids_members[index];
                    serives_all_1.Services.onGenerateCardMember({
                        id_cooperative: id_cooperative,
                        id_user: id_membre || index
                    })
                        .then(({ code, message, data }) => __awaiter(void 0, void 0, void 0, function* () {
                        (0, console_1.log)("Generated card is =======> ", data);
                        if (code === 200) {
                            const { card, expiresInString, expiresInUnix } = data;
                            serives_all_1.Services.addMemberToCoopec({
                                inputs: {
                                    idcooperative: parseInt(id_cooperative),
                                    idmember: id_membre || index,
                                    card,
                                    expiresIn: expiresInString,
                                    expiresInUnix: expiresInUnix.toString()
                                },
                                transaction: null,
                                cb: (err, done) => __awaiter(void 0, void 0, void 0, function* () {
                                    if (done) {
                                        const { code, message, data } = done;
                                        if (code === 200) {
                                            const treated = [];
                                            for (let index = 0; index < Array.from(data).length; index++) {
                                                const { TblEcomCooperativeId: ascoopec, TblEcomUserId: asuser } = Array.from(data)[index];
                                                const member = yield model_users_1.Users.findOne({ where: { id: parseInt(asuser) } });
                                                if (member instanceof model_users_1.Users) {
                                                    const { phone, email, id, nom } = member.toJSON();
                                                    serives_all_1.Services.onGenerateCardMember({
                                                        id_cooperative: ascoopec,
                                                        id_user: asuser
                                                    })
                                                        .then(({ code, message, data }) => __awaiter(void 0, void 0, void 0, function* () {
                                                        (0, console_1.log)("Generated card is =======> ", data);
                                                        if (code === 200) {
                                                            const { card, expiresInString, expiresInUnix } = data;
                                                            if (1) {
                                                                serives_all_1.Services.onSendSMS({
                                                                    to: (0, helper_fillphone_1.fillphone)({ phone }),
                                                                    is_flash: false,
                                                                    content: `Bonjour ${nom}, votre enregistrement dans la coopérative ${cooperative} en date du ${(0, helper_moment_1.now)({ options: {} })} a réussi, votre carte de membre sera expiré le ${expiresInString.toString()}`
                                                                })
                                                                    .then(m => { })
                                                                    .catch(e => { });
                                                                // treated.push(ext.toJSON())
                                                            }
                                                        }
                                                        else { }
                                                    }))
                                                        .catch((err) => {
                                                        (0, console_1.log)("Error on generating card member of ==> ", ascoopec, asuser, err);
                                                    });
                                                }
                                                else {
                                                    (0, console_1.log)("Error on generating card member of ==> user not initialized ", ascoopec, asuser, err);
                                                }
                                            }
                                            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, treated);
                                        }
                                        else {
                                            (0, console_1.log)(data);
                                            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, "Error on initializing members table !");
                                        }
                                    }
                                    else {
                                        (0, console_1.log)(done);
                                        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, "Error on initializing members table ! ===");
                                    }
                                })
                            });
                        }
                        else {
                            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.BadRequest, `The request can not be proceded cause the card can not be initialized !`);
                        }
                    }))
                        .catch(err => {
                        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err.toString());
                    });
                }
            }
            else {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotFound, `We can not process with this request cause ${id_cooperative}has not corres in Coopes table`);
            }
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    delete: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { idcooperative } = req.params;
        try {
            model_cooperatives_1.Cooperatives.findByPk(idcooperative)
                .then(coopec => {
                if (coopec instanceof model_cooperatives_1.Cooperatives) {
                    coopec.destroy({ force: true })
                        .then(D => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, D))
                        .catch(Er => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, Er));
                }
                else {
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotFound, coopec);
                }
            })
                .catch(err => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, err);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    update: (res, req) => __awaiter(void 0, void 0, void 0, function* () {
        const { idcooperative } = req.params;
        if (idcooperative)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "This request must have at least idccoperative !");
        if (Object.keys(req.body).length <= 0)
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotAcceptable, "The body should not be empty !");
        const { id_territoire, id_province, coordonnees_gps, adresse, phone, email, num_enregistrement, isformel, sigle, cooperative, id_adjoint, id_responsable, description, id_category } = req.body;
        try {
            model_cooperatives_1.Cooperatives.findOne({
                where: {
                    id: idcooperative
                }
            })
                .then(coop => {
                if (coop instanceof model_cooperatives_1.Cooperatives) {
                    coop.update({
                        id_territoire,
                        id_province,
                        coordonnees_gps,
                        adresse,
                        phone,
                        email,
                        num_enregistrement,
                        isformel,
                        sigle,
                        cooperative,
                        id_adjoint,
                        id_responsable,
                        description,
                        id_category
                    })
                        .then(U => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, U))
                        .catch(Err => (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, Err));
                }
                else {
                    return (0, helper_responseserver_1.Responder)(res, 404, coop);
                }
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    })
};
