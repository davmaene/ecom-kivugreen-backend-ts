import { query, validationResult, body, checkSchema } from 'express-validator';
import { NextFunction, Response, Request } from 'express';
import { Services } from '../__services/serives.all';
import { HttpStatusCode } from '../__enums/enum.httpsstatuscode';
import { Responder } from '../__helpers/helper.responseserver';
import { log } from 'console';

export const validateGender = (v: string) => {
    return ["M", "F"].indexOf(v) !== -1 ? true : false
};

export const roleValidator = async (v: number[]) => {
    const t = (await Services.rawRolesAsTableOfIds());
    return v.every(index => [...t].indexOf((index)) !== -1 ? true : false)
    // return [...t].indexOf((v)) !== -1 ? true : false;
};

export const provinceValidator = async (v: number) => {
    const t = (await Services.rawProvincesAsTableOfIds());
    return [...t].indexOf((v)) !== -1 ? true : false;
};

export const territoireValidator = async (v: number) => {
    const t = (await Services.rawTerritoiresAsTableOfIds());
    return [...t].indexOf((v)) !== -1 ? true : false;
};

export const villageValidator = async (v: number) => {
    const t = (await Services.rawVillagesAsTableOfIds());
    return [...t].indexOf((v)) !== -1 ? true : false;
};

export const userModelValidator = [
    body('nom').notEmpty().isAscii().withMessage("`nom` is required and it can not be empty !"),
    body('postnom').notEmpty().isAscii().withMessage("`postnom` is required and it can not be empty !"),
    body('email').optional().isEmail().trim().withMessage("`email` the value entered for email it seems to be not a valide email adresse !"),
    body('phone').notEmpty().isMobilePhone('fr-CD').trim().withMessage("`phone` the value entered for the phone it seems to be not a valide phone number !"),
    body('hectare_cultive').optional().isNumeric().withMessage("`hectare_cultive` the value for hectare_cultive is not invalid ! this must be a type of number !"),
    body('date_naiss').isDate({ format: 'DD/MM/YYYY' }).withMessage("`date_naiss` the value for date_naiss is not invalid ! this must be a type of valide date !"),
    body('genre').notEmpty().isString().isLength({ max: 1, min: 1 }).custom(validateGender).withMessage("`genre` the value for genre is not invalid ! this can only be M or F"),
    body('idprovince').optional().isNumeric().custom(async (v, { req }) => {
        const validator = await provinceValidator(v);
        return new Promise((resolve, reject) => {
            if (validator) resolve(true);
            else reject(false);
        });
    }).withMessage("`idprovince` the value for idprovince is not invalid ! this must be integer !"),
    body('idterritoire').optional().isNumeric().custom(async (v, { req }) => {
        const validator = await territoireValidator(v);
        return new Promise((resolve, reject) => {
            if (validator) resolve(true);
            else reject(false);
        });
    }).withMessage("`idterritoire` the value for idterritoire is not invalid ! this must be integer !"),
    body('idvillage').optional().isNumeric().withMessage("`idvillage` the value for idterritoire is not invalid ! this must be integer !"),
    body('password').notEmpty().isStrongPassword().withMessage("the password must have at least 8 characters; 1 Special character; 1 number, 1 lowercase letter, 1 uppercase letter. Ex: D@v12345678"),
    body('idroles').isArray({ min: 1 }).custom(async (v, { req }) => {
        const validator = await roleValidator(v);
        return new Promise((resolve, reject) => {
            if (validator) resolve(true);
            else reject(false);
        });
    }).withMessage("'idroles' idroles must be the type of array of numbers! and must ")
];

export const userModelOnVerification = [
    body('phone').notEmpty().isMobilePhone('fr-CD').trim().withMessage("`phone` the value entered for the phone it seems to be not a valide phone number !"),
    body('code').notEmpty().isNumeric().isLength({ max: 6, min: 6 }).withMessage("`code` the value entered for the code it seems to be not a valide value this must be numeric, lenght 6 !")
];

export const userModelOnResendCode = [
    body('phone').notEmpty().isMobilePhone('fr-CD').trim().withMessage("`phone` the value entered for the phone it seems to be not a valide phone number !")
];

export const userModelOnSignin = [
    body('phone').notEmpty().trim().withMessage("`phone` the value entered for the phone it seems to be not a valide phone number or a valide email !"),
    body('password').notEmpty().isString().withMessage("`Password` is required !")
];

export const dataValidator = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return Responder(res, HttpStatusCode.UnprocessableEntity, errors.array())
    } else next();
};

export const onValidate = (model: any) => [
    model, dataValidator
];