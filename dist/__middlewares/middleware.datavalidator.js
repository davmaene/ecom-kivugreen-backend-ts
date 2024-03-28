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
exports.onValidate = exports.dataValidator = exports.userModelOnSignin = exports.userModelOnResendCode = exports.userModelOnVerification = exports.userModelValidator = exports.produitValidator = exports.creditModelValidator = exports.bankModelValidator = exports.coopecModelValidator = exports.villageValidator = exports.userValidator = exports.territoireValidator = exports.provinceValidator = exports.roleValidator = exports.validateCategoryCoopec = exports.validateIsformel = exports.validateCurrency = exports.validateGender = void 0;
const express_validator_1 = require("express-validator");
const serives_all_1 = require("../__services/serives.all");
const enum_httpsstatuscode_1 = require("../__enums/enum.httpsstatuscode");
const helper_responseserver_1 = require("../__helpers/helper.responseserver");
const enum_categoriescooperatives_1 = require("../__enums/enum.categoriescooperatives");
const validateGender = (v) => {
    return ["M", "F"].indexOf(v) !== -1 ? true : false;
};
exports.validateGender = validateGender;
const validateCurrency = (v) => {
    return ["USD", "CDF"].indexOf(v) !== -1 ? true : false;
};
exports.validateCurrency = validateCurrency;
const validateIsformel = (v) => {
    v = (v ? v : '0');
    return [0, 1].indexOf(parseInt(v)) !== -1 ? true : false;
};
exports.validateIsformel = validateIsformel;
const validateCategoryCoopec = (v) => {
    const categs = Array.from(enum_categoriescooperatives_1.categoriescooperatives).map(categ => categ['id']);
    v = (v ? v : '0');
    return [...categs].indexOf(parseInt(v)) !== -1 ? true : false;
};
exports.validateCategoryCoopec = validateCategoryCoopec;
const roleValidator = (v) => __awaiter(void 0, void 0, void 0, function* () {
    const t = (yield serives_all_1.Services.rawRolesAsTableOfIds());
    return v.every(index => [...t].indexOf((index)) !== -1 ? true : false);
});
exports.roleValidator = roleValidator;
const provinceValidator = (v) => __awaiter(void 0, void 0, void 0, function* () {
    const t = (yield serives_all_1.Services.rawProvincesAsTableOfIds());
    v = (v ? v : '0');
    return [...t].indexOf(parseInt(v)) !== -1 ? true : false;
});
exports.provinceValidator = provinceValidator;
const territoireValidator = ({ v, vv }) => __awaiter(void 0, void 0, void 0, function* () {
    v = (v ? v : '0');
    vv = (vv ? vv : '0');
    const t = (yield serives_all_1.Services.rawTerritoiresAsTableOfIds({ idprovince: parseInt(vv) }));
    return [...t].indexOf(parseInt(v)) !== -1 ? true : false;
});
exports.territoireValidator = territoireValidator;
const userValidator = (v) => __awaiter(void 0, void 0, void 0, function* () {
    const t = (yield serives_all_1.Services.rawUsersAsTableOfIds());
    v = (v ? v : '0');
    return [...t].indexOf(parseInt(v)) !== -1 ? true : false;
});
exports.userValidator = userValidator;
const villageValidator = (v) => __awaiter(void 0, void 0, void 0, function* () {
    v = (v ? v : '0');
    const t = (yield serives_all_1.Services.rawVillagesAsTableOfIds({ idterritoire: parseInt(v) }));
    return [...t].indexOf(parseInt(v)) !== -1 ? true : false;
});
exports.villageValidator = villageValidator;
exports.coopecModelValidator = [
    (0, express_validator_1.body)('sigle').notEmpty().isAscii().withMessage("`sigle` is required and it can not be empty ! must be string"),
    (0, express_validator_1.body)('cooperative').notEmpty().isString().withMessage("name of `cooperative` is required and it can not be empty ! must be string"),
    (0, express_validator_1.body)('id_province').isNumeric().custom((v, { req }) => __awaiter(void 0, void 0, void 0, function* () {
        const validator = yield (0, exports.provinceValidator)(v);
        return new Promise((resolve, reject) => {
            if (validator)
                resolve(true);
            else
                reject(false);
        });
    })).withMessage("`id_province` the value for id_province is not invalid ! this must be integer !"),
    (0, express_validator_1.body)('id_territoire').isNumeric().custom((v, { req }) => __awaiter(void 0, void 0, void 0, function* () {
        const { id_province } = req.body;
        const validator = yield (0, exports.territoireValidator)({ v, vv: id_province });
        return new Promise((resolve, reject) => {
            if (validator)
                resolve(true);
            else
                reject(false);
        });
    })).withMessage("`id_territoire` the value for id_territoire is not invalid ! this must be integer !"),
    (0, express_validator_1.body)('id_responsable').isNumeric().custom((v, { req }) => __awaiter(void 0, void 0, void 0, function* () {
        const validator = yield (0, exports.userValidator)(v);
        return new Promise((resolve, reject) => {
            if (validator)
                resolve(true);
            else
                reject(false);
        });
    })).withMessage("`id_responsable` the value for id_responsable is not invalid ! this must be integer !"),
    (0, express_validator_1.body)('id_adjoint').isNumeric().custom((v, { req }) => __awaiter(void 0, void 0, void 0, function* () {
        const validator = yield (0, exports.userValidator)(v);
        return new Promise((resolve, reject) => {
            if (validator)
                resolve(true);
            else
                reject(false);
        });
    })).withMessage("`id_adjoint` the value for id_adjoint is not invalid ! this must be integer !"),
    (0, express_validator_1.body)('description').notEmpty().isAscii().withMessage("`description` is required and it can not be empty ! must be string"),
    (0, express_validator_1.body)('coordonnees_gps').optional().isAscii().withMessage("`coordonnees_gps` is required and it can not be empty ! must be string"),
    (0, express_validator_1.body)('adresse').optional().isAscii().withMessage("`adresse` is required and it can not be empty ! must be string"),
    (0, express_validator_1.body)('phone').notEmpty().isMobilePhone('fr-CD').trim().withMessage("`phone` the value entered for the phone it seems to be not a valide phone number !"),
    (0, express_validator_1.body)('email').optional().isEmail().trim().withMessage("`email` the value entered for email it seems to be not a valide email adresse !"),
    (0, express_validator_1.body)('isformel').notEmpty().isNumeric().isLength({ max: 1, min: 1 }).custom(exports.validateIsformel).withMessage("`isformel` the value for isformel is not invalid ! this can only be 1 or 0"),
    (0, express_validator_1.body)('id_category').notEmpty().isNumeric().isLength({ max: 1, min: 1 }).custom(exports.validateCategoryCoopec).withMessage("`id_category` the value for id_category is not invalid ! this can only be 1 or 0"),
];
exports.bankModelValidator = [
    (0, express_validator_1.body)('bank').notEmpty().isAscii().withMessage("`bank` is required and it can not be empty ! must be string"),
    (0, express_validator_1.body)('id_responsable').isNumeric().custom((v, { req }) => __awaiter(void 0, void 0, void 0, function* () {
        const validator = yield (0, exports.userValidator)(v);
        return new Promise((resolve, reject) => {
            if (validator)
                resolve(true);
            else
                reject(false);
        });
    })).withMessage("`id_responsable` the value for id_responsable is not invalid ! this must be integer !"),
    (0, express_validator_1.body)('description').notEmpty().isAscii().withMessage("`description` is required and it can not be empty ! must be string"),
    (0, express_validator_1.body)('adresse').optional().isAscii().withMessage("`adresse` is required and it can not be empty ! must be string"),
    (0, express_validator_1.body)('phone').notEmpty().isMobilePhone('fr-CD').trim().withMessage("`phone` the value entered for the phone it seems to be not a valide phone number !"),
    (0, express_validator_1.body)('email').optional().isEmail().trim().withMessage("`email` the value entered for email it seems to be not a valide email adresse !"),
];
exports.creditModelValidator = [
    (0, express_validator_1.body)('id_user').optional().isNumeric().custom((v, { req }) => __awaiter(void 0, void 0, void 0, function* () {
        const validator = yield (0, exports.userValidator)(v);
        return new Promise((resolve, reject) => {
            if (validator)
                resolve(true);
            else
                reject(false);
        });
    })).withMessage("`id_user` the value for id_user is not invalid ! this must be integer ! and must have corres => in users table"),
    (0, express_validator_1.body)('montant').notEmpty().isNumeric().withMessage("`montant` is required and it can not be empty ! must be numeric"),
    (0, express_validator_1.body)('currency').notEmpty().isString().isLength({ max: 3, min: 3 }).custom(exports.validateCurrency).isAscii().withMessage("`currency` is required and it can not be empty ! must be string USD || CDF"),
    (0, express_validator_1.body)('motif').notEmpty().isAscii().trim().withMessage("`motif` the value entered for the motif it seems to be not a valide string !"),
    (0, express_validator_1.body)('periode_remboursement').notEmpty().isNumeric().withMessage("`periode_remboursement` the value entered for periode_remboursement it seems to be not a valide number !"),
];
exports.produitValidator = [
    (0, express_validator_1.body)('produit').notEmpty().isAscii().withMessage("the name of the `produit` is required and it can not be empty !"),
    (0, express_validator_1.body)('description').notEmpty().isAscii().withMessage("`description` is required and it can not be empty !"),
    (0, express_validator_1.body)('id_unity').notEmpty().isAscii().withMessage("`id_unity` is required and it can not be empty !"),
    (0, express_validator_1.body)('id_category').notEmpty().isAscii().withMessage("`id_category` is required and it can not be empty !"),
    (0, express_validator_1.body)('id_souscategory').notEmpty().isAscii().withMessage("`id_souscategory` is required and it can not be empty !"),
];
exports.userModelValidator = [
    (0, express_validator_1.body)('nom').notEmpty().isAscii().withMessage("`nom` is required and it can not be empty !"),
    (0, express_validator_1.body)('postnom').notEmpty().isAscii().withMessage("`postnom` is required and it can not be empty !"),
    (0, express_validator_1.body)('email').optional().isEmail().trim().withMessage("`email` the value entered for email it seems to be not a valide email adresse !"),
    (0, express_validator_1.body)('phone').notEmpty().isMobilePhone('fr-CD').trim().withMessage("`phone` the value entered for the phone it seems to be not a valide phone number !"),
    (0, express_validator_1.body)('hectare_cultive').optional().isNumeric().withMessage("`hectare_cultive` the value for hectare_cultive is not invalid ! this must be a type of number !"),
    (0, express_validator_1.body)('date_naiss').isDate({ format: 'DD/MM/YYYY' }).withMessage("`date_naiss` the value for date_naiss is not invalid ! this must be a type of valide date !"),
    (0, express_validator_1.body)('genre').notEmpty().isString().isLength({ max: 1, min: 1 }).custom(exports.validateGender).withMessage("`genre` the value for genre is not invalid ! this can only be M or F"),
    (0, express_validator_1.body)('idprovince').optional().isNumeric().custom((v, { req }) => __awaiter(void 0, void 0, void 0, function* () {
        const validator = yield (0, exports.provinceValidator)(v);
        return new Promise((resolve, reject) => {
            if (validator)
                resolve(true);
            else
                reject(false);
        });
    })).withMessage("`idprovince` the value for idprovince is not invalid ! this must be integer !"),
    (0, express_validator_1.body)('idterritoire').optional().isNumeric().custom((v, { req }) => __awaiter(void 0, void 0, void 0, function* () {
        const validator = yield (0, exports.territoireValidator)(v);
        return new Promise((resolve, reject) => {
            if (validator)
                resolve(true);
            else
                reject(false);
        });
    })).withMessage("`idterritoire` the value for idterritoire is not invalid ! this must be integer !"),
    (0, express_validator_1.body)('idvillage').optional().isNumeric().withMessage("`idvillage` the value for idterritoire is not invalid ! this must be integer !"),
    (0, express_validator_1.body)('password').notEmpty().isStrongPassword().withMessage("the password must have at least 8 characters; 1 Special character; 1 number, 1 lowercase letter, 1 uppercase letter. Ex: D@v12345678"),
    (0, express_validator_1.body)('idroles').isArray({ min: 1 }).custom((v, { req }) => __awaiter(void 0, void 0, void 0, function* () {
        const validator = yield (0, exports.roleValidator)(v);
        return new Promise((resolve, reject) => {
            if (validator)
                resolve(true);
            else
                reject(false);
        });
    })).withMessage("'idroles' idroles must be the type of array of numbers! and must ")
];
exports.userModelOnVerification = [
    (0, express_validator_1.body)('phone').notEmpty().isMobilePhone('fr-CD').trim().withMessage("`phone` the value entered for the phone it seems to be not a valide phone number !"),
    (0, express_validator_1.body)('code').notEmpty().isNumeric().isLength({ max: 6, min: 6 }).withMessage("`code` the value entered for the code it seems to be not a valide value this must be numeric, lenght 6 !")
];
exports.userModelOnResendCode = [
    (0, express_validator_1.body)('phone').notEmpty().isMobilePhone('fr-CD').trim().withMessage("`phone` the value entered for the phone it seems to be not a valide phone number !")
];
exports.userModelOnSignin = [
    (0, express_validator_1.body)('phone').notEmpty().trim().withMessage("`phone` the value entered for the phone it seems to be not a valide phone number or a valide email !"),
    (0, express_validator_1.body)('password').notEmpty().isString().withMessage("`Password` is required !")
];
const dataValidator = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.UnprocessableEntity, errors.array());
    }
    else
        next();
};
exports.dataValidator = dataValidator;
const onValidate = (model) => [
    model, exports.dataValidator
];
exports.onValidate = onValidate;
