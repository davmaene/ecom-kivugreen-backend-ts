import { query, validationResult, body, checkSchema } from 'express-validator';
import { NextFunction, Response, Request } from 'express';
import { Services } from '../__services/serives.all';
import { HttpStatusCode } from '../__enums/enum.httpsstatuscode';
import { Responder } from '../__helpers/helper.responseserver';
import { log } from 'console';
import { categoriescooperatives } from '../__enums/enum.categoriescooperatives';

export const validateGender = (v: string) => {
    return ["M", "F"].indexOf(v) !== -1 ? true : false
};

export const validateCurrency = (v: string) => {
    return ["USD", "CDF"].indexOf(v) !== -1 ? true : false
};

export const validateIsformel = (v: string) => {
    v = (v ? v : '0')
    return [0, 1].indexOf(parseInt(v)) !== -1 ? true : false
};

export const validateCategoryCoopec = (v: string) => {
    const categs = Array.from(categoriescooperatives).map(categ => categ['id'])
    v = (v ? v : '0')
    return [...categs].indexOf(parseInt(v)) !== -1 ? true : false
};

export const roleValidator = async (v: number[]) => {
    const t = (await Services.rawRolesAsTableOfIds());
    return v.every(index => [...t].indexOf((index)) !== -1 ? true : false)
};

export const provinceValidator = async (v: string) => {
    const t = (await Services.rawProvincesAsTableOfIds());
    v = (v ? v : '0')
    return [...t].indexOf(parseInt(v)) !== -1 ? true : false;
};

export const territoireValidator = async ({ v, vv }: { v: string, vv: string }) => {
    log("===============> ",v, vv)
    v = (v ? v : '0')
    vv = (vv ? vv : '0')
    const t = (await Services.rawTerritoiresAsTableOfIds({ idprovince: parseInt(vv) }));
    return [...t].indexOf(parseInt(v)) !== -1 ? true : false;
};

export const userValidator = async (v: string) => {
    const t = (await Services.rawUsersAsTableOfIds());
    v = (v ? v : '0')
    return [...t].indexOf(parseInt(v)) !== -1 ? true : false;
};

export const villageValidator = async (v: string) => {
    v = (v ? v : '0')
    const t = (await Services.rawVillagesAsTableOfIds({ idterritoire: parseInt(v) }));
    return [...t].indexOf(parseInt(v)) !== -1 ? true : false;
};

export const coopecModelValidator = [
    body('sigle').notEmpty().isString().withMessage("`sigle` is required and it can not be empty ! must be string"),
    body('cooperative').notEmpty().isString().withMessage("name of `cooperative` is required and it can not be empty ! must be string"),
    body('id_province').isNumeric().custom(async (v, { req }) => {
        const validator = await provinceValidator(v);
        return new Promise((resolve, reject) => {
            if (validator) resolve(true);
            else reject(false);
        });
    }).withMessage("`id_province` the value for id_province is not invalid ! this must be integer !"),
    body('id_territoire').isNumeric().custom(async (v, { req }) => {
        const { id_province } = req.body
        const validator = await territoireValidator({ v, vv: id_province });
        return new Promise((resolve, reject) => {
            if (validator) resolve(true);
            else reject(false);
        });
    }).withMessage("`id_territoire` the value for id_territoire is not invalid ! this must be integer !"),
    body('id_responsable').isNumeric().custom(async (v, { req }) => {
        const validator = await userValidator(v);
        return new Promise((resolve, reject) => {
            if (validator) resolve(true);
            else reject(false);
        });
    }).withMessage("`id_responsable` the value for id_responsable is not invalid ! this must be integer !"),
    body('id_adjoint').isNumeric().custom(async (v, { req }) => {
        const validator = await userValidator(v);
        return new Promise((resolve, reject) => {
            if (validator) resolve(true);
            else reject(false);
        });
    }).withMessage("`id_adjoint` the value for id_adjoint is not invalid ! this must be integer !"),
    body('description').notEmpty().isString().withMessage("`description` is required and it can not be empty ! must be string"),
    body('coordonnees_gps').optional().isString().withMessage("`coordonnees_gps` is required and it can not be empty ! must be string"),
    body('adresse').optional().isString().withMessage("`adresse` is required and it can not be empty ! must be string"),
    body('phone').notEmpty().isMobilePhone('fr-CD').trim().withMessage("`phone` the value entered for the phone it seems to be not a valide phone number !"),
    body('email').optional().isEmail().trim().withMessage("`email` the value entered for email it seems to be not a valide email adresse !"),
    body('isformel').notEmpty().isNumeric().isLength({ max: 1, min: 1 }).custom(validateIsformel).withMessage("`isformel` the value for isformel is not invalid ! this can only be 1 or 0"),
    body('id_category').notEmpty().isNumeric().isLength({ max: 1, min: 1 }).custom(validateCategoryCoopec).withMessage("`id_category` the value for id_category is not invalid ! this can only be 1 or 0"),
];

export const bankModelValidator = [
    body('bank').notEmpty().isString().withMessage("`bank` is required and it can not be empty ! must be string"),
    body('id_responsable').isNumeric().custom(async (v, { req }) => {
        const validator = await userValidator(v);
        return new Promise((resolve, reject) => {
            if (validator) resolve(true);
            else reject(false);
        });
    }).withMessage("`id_responsable` the value for id_responsable is not invalid ! this must be integer !"),
    body('description').notEmpty().isString().withMessage("`description` is required and it can not be empty ! must be string"),
    body('adresse').optional().isString().withMessage("`adresse` is required and it can not be empty ! must be string"),
    body('phone').notEmpty().isMobilePhone('fr-CD').trim().withMessage("`phone` the value entered for the phone it seems to be not a valide phone number !"),
    body('email').optional().isEmail().trim().withMessage("`email` the value entered for email it seems to be not a valide email adresse !"),
]

export const creditModelValidator = [
    body('id_user').optional().isNumeric().custom(async (v, { req }) => {
        const validator = await userValidator(v);
        return new Promise((resolve, reject) => {
            if (validator) resolve(true);
            else reject(false);
        });
    }).withMessage("`id_user` the value for id_user is not invalid ! this must be integer ! and must have corres => in users table"),
    body('montant').notEmpty().isNumeric().withMessage("`montant` is required and it can not be empty ! must be numeric"),
    body('currency').notEmpty().isString().isLength({ max: 3, min: 3 }).custom(validateCurrency).isString().withMessage("`currency` is required and it can not be empty ! must be string USD || CDF"),
    body('motif').notEmpty().isString().trim().withMessage("`motif` the value entered for the motif it seems to be not a valide string !"),
    body('periode_remboursement').notEmpty().isNumeric().withMessage("`periode_remboursement` the value entered for periode_remboursement it seems to be not a valide number !"),
]

export const produitValidator = [
    body('tva').optional().isNumeric().withMessage("Please provide the value of the tva as a number !"),
    body('produit').notEmpty().isString().withMessage("the name of the `produit` is required and it can not be empty !"),
    body('description').notEmpty().isString().withMessage("`description` is required and it can not be empty !"),
    body('id_unity').notEmpty().isNumeric().withMessage("`id_unity` is required and it can not be empty !"),
    body('id_category').notEmpty().isNumeric().withMessage("`id_category` is required and it can not be empty !"),
    body('id_souscategory').optional().isNumeric().withMessage("`id_souscategory` is required and it can not be empty !"),
];

// .isStrongPassword()
export const userModelValidator = [
    body('nom').notEmpty().isString().withMessage("`nom` is required and it can not be empty !"),
    body('postnom').notEmpty().isString().withMessage("`postnom` is required and it can not be empty !"),
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
        const { idprovince } = req.body
        const validator = await territoireValidator({ v, vv: idprovince })
        return new Promise((resolve, reject) => {
            if (validator) resolve(true);
            else reject(false);
        });
    }).withMessage("`idterritoire` the value for idterritoire is not invalid ! this must be integer !"),
    body('idvillage').optional().isNumeric().withMessage("`idvillage` the value for idterritoire is not invalid ! this must be integer !"),
    body('password').notEmpty().withMessage("the password must have at least 8 characters; 1 Special character; 1 number, 1 lowercase letter, 1 uppercase letter. Ex: D@v12345678"),
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