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
exports.Services = void 0;
const middleware_cookies_1 = require("./../__middlewares/middleware.cookies");
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const model_hasroles_1 = require("../__models/model.hasroles");
const helper_random_1 = require("../__helpers/helper.random");
const helper_all_1 = require("../__helpers/helper.all");
const nodemailer_1 = __importDefault(require("nodemailer"));
const model_roles_1 = require("../__models/model.roles");
const model_provinces_1 = require("../__models/model.provinces");
const model_territoires_1 = require("../__models/model.territoires");
const model_villages_1 = require("../__models/model.villages");
const helper_fillphone_1 = require("../__helpers/helper.fillphone");
const console_1 = require("console");
const model_users_1 = require("../__models/model.users");
const model_hasmembers_1 = require("../__models/model.hasmembers");
const fs_1 = __importDefault(require("fs"));
const model_configs_1 = require("../__models/model.configs");
const helper_moment_1 = require("../__helpers/helper.moment");
const base_64_1 = __importDefault(require("base-64"));
dotenv_1.default.config();
const { API_SMS_ENDPOINT, APP_NAME, API_SMS_TOKEN, API_SMS_IS_FLASH, APP_FLEXPAYRETROCOMMISIONNE } = process.env;
if (!APP_FLEXPAYRETROCOMMISIONNE || !APP_NAME || !API_SMS_ENDPOINT)
    throw new Error;
let tempfolder = 'as_assets';
exports.Services = {
    accomplishePayement: ({}) => __awaiter(void 0, void 0, void 0, function* () {
    }),
    calcAmountBeforePaiement: ({ amount }) => {
        const comm = parseFloat(APP_FLEXPAYRETROCOMMISIONNE) || 0;
        return (amount - (amount * (comm / 100)));
    },
    reCalcAmountBeforePaiement: ({ amount }) => {
        const comm = parseFloat(APP_FLEXPAYRETROCOMMISIONNE) || 0;
        return (amount + (amount * (comm / 100)));
    },
    converterDevise: ({ amount, currency }) => __awaiter(void 0, void 0, void 0, function* () {
        const configs = yield model_configs_1.Configs.findAll({
            order: [['id', 'DESC']],
            limit: 1
            // where: {
            //     id: 1
            // }
        });
        if (configs.length > 0) {
            const { id, taux_change, commission_price } = configs[0];
            const tauxDeChange = taux_change || 3000;
            currency = currency.toUpperCase();
            if (currency === 'USD') {
                return { code: 200, message: `Amount converted from USD to CDF with tx(${tauxDeChange})`, data: { currency, amount: amount * tauxDeChange } };
            }
            else if (currency === 'CDF') {
                return { code: 200, message: 'Currency is still CDF', data: { currency, amount } };
            }
            else {
                return { code: 500, message: 'Not supported currency !', data: { currency, amount } };
            }
        }
        else {
            return { code: 500, message: 'Error occured ! we can not find Configs :::', data: { currency, amount } };
        }
    }),
    convertCurrency: ({ amount, fromCurrency, toCurrency }) => __awaiter(void 0, void 0, void 0, function* () {
        const apiKey = 'YOUR_API_KEY';
        const url = `http://data.fixer.io/api/latest?access_key=${apiKey}&base=${fromCurrency}&symbols=${toCurrency}`;
        try {
            const response = yield fetch(url);
            const data = yield response.json();
            if (!response.ok || data.error) {
                throw new Error(data.error ? data.error.info : 'Erreur lors de la récupération des taux de change');
            }
            if (!data.rates.hasOwnProperty(toCurrency)) {
                throw new Error("La devise cible n'est pas prise en charge");
            }
            const rate = data.rates[toCurrency];
            const convertedAmount = amount * rate;
            return convertedAmount;
        }
        catch (error) {
            return error.message;
        }
    }),
    loggerSystem: ({ message, title }) => {
        const fl = fs_1.default.createWriteStream('src/__assets/as_log/log.system.infos.ini', {
            flags: 'a' // 'a' means appending (old data will be preserved)
        });
        fl.write(`\n Title => ${title}\n Info => ${message}\n Temps => ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
        fl.write(`\n--------------------------------------------------------------------`);
        fl.close();
    },
    onSendSMS: ({ to, content, is_flash }) => __awaiter(void 0, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                // || API_SMS_IS_FLASH,
                const payload = {
                    'phone': (0, helper_fillphone_1.completeCodeCountryToPhoneNumber)({ phone: to, withoutplus: false }),
                    'message': content,
                    'is_flash': (is_flash ? 1 : 0),
                    'app': APP_NAME
                };
                const { data, status, request, config, headers, statusText } = yield (0, axios_1.default)({
                    method: "POST",
                    url: API_SMS_ENDPOINT,
                    data: payload,
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${API_SMS_TOKEN}`
                    }
                });
                (0, console_1.log)("Message was sent to ==> ", payload['phone'], "Content ==> ", payload['message'], "is_flash ==> ", is_flash);
                if (status === 200 || status === 201)
                    return resolve({ code: status, message: "Message was succefuly sent ", data: data });
                else
                    return reject({ code: status, message: statusText, data });
            }
            catch (error) {
                (0, console_1.log)(error.toString());
                return reject({ code: 500, message: "Error on sending message", data: error.toString() });
            }
        }));
    }),
    onSendMailConfirmation: ({ cb, to, content: { fullname, confirmationink } }) => __awaiter(void 0, void 0, void 0, function* () {
        cb = cb ? cb : () => { };
        fullname = (0, helper_all_1.capitalizeWords)({ text: fullname });
        const transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: 'mukulima.app@gmail.com',
                pass: 'zusa tcto irad zvqb' || 'fesx oblh dadb zwwo' || 'Mukulima@2002'
            }
        });
        const mailOptions = {
            from: 'Mukulima App, mukulima.app@gmail.com',
            to,
            subject: 'Configuration',
            html: `<!DOCTYPE html>
            <html xmlns:v="urn:schemas-microsoft-com:vml"
                xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
            
                <head>
                    <title></title>
                    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                    <meta name="viewport"
                        content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--[if !mso]><!-->
                    <link href="https://fonts.googleapis.com/css?family=Noto+Serif"
                        rel="stylesheet" type="text/css">
                    <link
                        href="https://fonts.googleapis.com/css2?family=Inter&amp;family=Work+Sans:wght@700&amp;display=swap"
                        rel="stylesheet" type="text/css"><!--<![endif]-->
                    <style>
                    * {
                        box-sizing: border-box;
                    }
            
                    body {
                        margin: 0;
                        padding: 0;
                    }
            
                    a[x-apple-data-detectors] {
                        color: inherit !important;
                        text-decoration: inherit !important;
                    }
            
                    #MessageViewBody a {
                        color: inherit;
                        text-decoration: none;
                    }
            
                    p {
                        line-height: inherit
                    }
            
                    .desktop_hide,
                    .desktop_hide table {
                        mso-hide: all;
                        display: none;
                        max-height: 0px;
                        overflow: hidden;
                    }
            
                    .image_block img+div {
                        display: none;
                    }
            
                    @media (max-width:720px) {
                        .desktop_hide table.icons-inner {
                            display: inline-block !important;
                        }
            
                        .icons-inner {
                            text-align: center;
                        }
            
                        .icons-inner td {
                            margin: 0 auto;
                        }
            
                        .mobile_hide {
                            display: none;
                        }
            
                        .row-content {
                            width: 100% !important;
                        }
            
                        .stack .column {
                            width: 100%;
                            display: block;
                        }
            
                        .mobile_hide {
                            min-height: 0;
                            max-height: 0;
                            max-width: 0;
                            overflow: hidden;
                            font-size: 0px;
                        }
            
                        .desktop_hide,
                        .desktop_hide table {
                            display: table !important;
                            max-height: none !important;
                        }
            
                        .row-13 .column-1 .block-1.heading_block h1,
                        .row-13 .column-2 .block-1.paragraph_block td.pad>div,
                        .row-14 .column-2 .block-1.paragraph_block td.pad>div,
                        .row-2 .column-2 .block-1.paragraph_block td.pad>div,
                        .row-3 .column-1 .block-4.heading_block h1,
                        .row-6 .column-2 .block-1.heading_block h1,
                        .row-6 .column-2 .block-2.heading_block h1,
                        .row-6 .column-2 .block-3.paragraph_block td.pad>div,
                        .row-7 .column-2 .block-1.heading_block h1,
                        .row-7 .column-2 .block-2.heading_block h1,
                        .row-7 .column-2 .block-3.paragraph_block td.pad>div {
                            text-align: center !important;
                        }
            
                        .row-13 .column-2 .block-1.paragraph_block td.pad {
                            padding: 0 !important;
                        }
            
                        .row-14 .column-1,
                        .row-2 .column-1,
                        .row-4 .column-1,
                        .row-9 .column-1 {
                            padding: 20px 10px !important;
                        }
            
                        .row-2 .column-2 {
                            padding: 5px 25px 20px !important;
                        }
            
                        .row-6 .column-1,
                        .row-7 .column-1 {
                            padding: 15px 25px 0 !important;
                        }
            
                        .row-6 .column-2,
                        .row-7 .column-2 {
                            padding: 15px 20px 25px !important;
                        }
            
                        .row-10 .column-1 {
                            padding: 40px 20px !important;
                        }
            
                        .row-12 .column-1 {
                            padding: 0 20px 40px !important;
                        }
            
                        .row-13 .column-1 {
                            padding: 40px 25px 25px !important;
                        }
            
                        .row-13 .column-2 {
                            padding: 5px 25px 40px !important;
                        }
            
                        .row-14 .column-2 {
                            padding: 5px 30px 20px 25px !important;
                        }
                    }
                </style>
                </head>
            
                <body
                    style="background-color: #f7f7f7; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
                    <table class="nl-container" width="100%" border="0" cellpadding="0"
                        cellspacing="0" role="presentation"
                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f7f7f7;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row row-1" align="center" width="100%"
                                        border="0" cellpadding="0" cellspacing="0"
                                        role="presentation"
                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <table class="row-content stack"
                                                        align="center" border="0"
                                                        cellpadding="0" cellspacing="0"
                                                        role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; width: 700px; margin: 0 auto;"
                                                        width="700">
                                                        <tbody>
                                                            <tr>
                                                                <td class="column column-1"
                                                                    width="100%"
                                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                    <div
                                                                        class="spacer_block block-1"
                                                                        style="height:15px;line-height:15px;font-size:1px;">&#8202;</div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table class="row row-3" align="center" width="100%"
                                        border="0" cellpadding="0" cellspacing="0"
                                        role="presentation"
                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <table class="row-content stack"
                                                        align="center" border="0"
                                                        cellpadding="0" cellspacing="0"
                                                        role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #efeef4; border-bottom: 0 solid #EFEEF4; border-left: 0 solid #EFEEF4; border-right: 0px solid #EFEEF4; border-top: 0 solid #EFEEF4; color: #000000; width: 700px; margin: 0 auto;"
                                                        width="700">
                                                        <tbody>
                                                            <tr>
                                                                <td class="column column-1"
                                                                    width="100%"
                                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 25px; padding-left: 25px; padding-right: 25px; padding-top: 35px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                    <table
                                                                        class="icons_block block-1"
                                                                        width="100%"
                                                                        border="0"
                                                                        cellpadding="0"
                                                                        cellspacing="0"
                                                                        role="presentation"
                                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                        <tr>
                                                                            <td class="pad"
                                                                                style="vertical-align: middle; color: #4f5aba; font-family: 'Noto Serif', Georgia, serif; font-size: 24px; letter-spacing: 0px; padding-bottom: 10px; padding-top: 10px; text-align: center;">
                                                                                <table
                                                                                    class="alignment"
                                                                                    cellpadding="0"
                                                                                    cellspacing="0"
                                                                                    role="presentation"
                                                                                    align="center"
                                                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                    <tr>
                                                                                        <td
                                                                                            style="vertical-align: middle; text-align: center; padding-top: 0px; padding-bottom: 0px; padding-left: 20px; padding-right: 20px;"><a
                                                                                                href="https://mukulima.com"
                                                                                                target="_self"
                                                                                                style="text-decoration: none;"><img
                                                                                                    class="icon"
                                                                                                    src="https://backend.mukulima.com/assets/s/fgreen.png"
                                                                                                    alt="new year celebration"
                                                                                                    height="128"
                                                                                                    width="109"
                                                                                                    align="center"
                                                                                                    style="display: block; height: auto; margin: 0 auto; border: 0;"></a></td>
                                                                                    </tr>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                    <table
                                                                        class="heading_block block-2"
                                                                        width="100%"
                                                                        border="0"
                                                                        cellpadding="0"
                                                                        cellspacing="0"
                                                                        role="presentation"
                                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                        <tr>
                                                                            <td class="pad"
                                                                                style="padding-top:10px;text-align:center;width:100%;">
                                                                                <h1
                                                                                    style="margin: 0; color: #003300; direction: ltr; font-family: 'Noto Serif', Georgia, serif; font-size: 41px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 49.199999999999996px;"><span
                                                                                        class="tinyMce-placeholder">FELICITATION&nbsp;</span></h1>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                    <table
                                                                        class="heading_block block-3"
                                                                        width="100%"
                                                                        border="0"
                                                                        cellpadding="0"
                                                                        cellspacing="0"
                                                                        role="presentation"
                                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                        <tr>
                                                                            <td class="pad"
                                                                                style="padding-bottom:10px;padding-top:10px;text-align:center;width:100%;">
                                                                                <h2
                                                                                    style="margin: 0; color: #201f42; direction: ltr; font-family: 'Noto Serif', Georgia, serif; font-size: 24px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 28.799999999999997px;">${fullname}</h2>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                    <table
                                                                        class="heading_block block-4"
                                                                        width="100%"
                                                                        border="0"
                                                                        cellpadding="10"
                                                                        cellspacing="0"
                                                                        role="presentation"
                                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                        <!-- <tr>
                                                                            <td class="pad">
                                                                                <h1
                                                                                    style="margin: 0; color: #201f42; direction: ltr; font-family: Inter, sans-serif; font-size: 18px; font-weight: 400; letter-spacing: normal; line-height: 150%; text-align: center; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 27px;"><span
                                                                                        class="tinyMce-placeholder">DECEMBER
                                                                                        18TH
                                                                                        2023<br>7:00
                                                                                        -
                                                                                        9:30
                                                                                        PM<br></span></h1>
                                                                            </td>
                                                                        </tr> -->
                                                                    </table>
                                                                    <table
                                                                        class="paragraph_block block-5"
                                                                        width="100%"
                                                                        border="0"
                                                                        cellpadding="0"
                                                                        cellspacing="0"
                                                                        role="presentation"
                                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                        <tr>
                                                                            <td class="pad"
                                                                                style="padding-left:10px;padding-right:10px;">
                                                                                <div
                                                                                    style="color:#201f42;direction:ltr;font-family:Inter, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:180%;text-align:center;mso-line-height-alt:28.8px;">
                                                                                    <p
                                                                                        style="margin: 0;">Nous
                                                                                        sommes
                                                                                        ravis
                                                                                        de
                                                                                        vous
                                                                                        accueillir
                                                                                        chez
                                                                                        APPNAME
                                                                                        !
                                                                                        Merci
                                                                                        de
                                                                                        choisir
                                                                                        notre
                                                                                        service.
            
                                                                                        Pour
                                                                                        finaliser
                                                                                        votre
                                                                                        inscription,
                                                                                        veuillez
                                                                                        confirmer
                                                                                        votre
                                                                                        adresse
                                                                                        e-mail
                                                                                        en
                                                                                        cliquant
                                                                                        sur
                                                                                        le
                                                                                        lien
                                                                                        ci-dessous
                                                                                        :
            
                                                                                        [${confirmationink}]
            
                                                                                        Cette
                                                                                        étape
                                                                                        est
                                                                                        cruciale
                                                                                        pour
                                                                                        garantir
                                                                                        la
                                                                                        sécurité
                                                                                        de
                                                                                        votre
                                                                                        compte
                                                                                        et
                                                                                        vous
                                                                                        tenir
                                                                                        informé(e)
                                                                                        de
                                                                                        toutes
                                                                                        les
                                                                                        mises
                                                                                        à
                                                                                        jour
                                                                                        importantes.
                                                                                        En
                                                                                        cas
                                                                                        de
                                                                                        problème,
                                                                                        n'hésitez
                                                                                        pas
                                                                                        à
                                                                                        nous
                                                                                        contacter
                                                                                        à
                                                                                        [{MAILAPP}].
            
                                                                                        Nous
                                                                                        sommes
                                                                                        impatients
                                                                                        de
                                                                                        vous
                                                                                        offrir
                                                                                        la
                                                                                        meilleure
                                                                                        expérience
                                                                                        possible.
            
                                                                                        Cordialement&nbsp;</p>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                    <table
                                                                        class="button_block block-6"
                                                                        width="100%"
                                                                        border="0"
                                                                        cellpadding="0"
                                                                        cellspacing="0"
                                                                        role="presentation"
                                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                        <tr>
                                                                            <td class="pad"
                                                                                style="padding-bottom:15px;padding-top:20px;text-align:center;">
                                                                                <div
                                                                                    class="alignment"
                                                                                    align="center"><a
                                                                                        href="${confirmationink}"
                                                                                        target="_blank"
                                                                                        style="text-decoration:none;display:inline-block;color:#ffffff;background-color:#003300;border-radius:0px;width:auto;border-top:1px solid #201F42;font-weight:400;border-right:1px solid #201F42;border-bottom:1px solid #201F42;border-left:1px solid #201F42;padding-top:5px;padding-bottom:5px;font-family:'Noto Serif', Georgia, serif;font-size:16px;text-align:center;mso-border-alt:none;word-break:keep-all;"><span
                                                                                            style="padding-left:30px;padding-right:30px;font-size:16px;display:inline-block;letter-spacing:normal;"><span
                                                                                                style="word-break: break-word; line-height: 32px;">CONFIRMER
                                                                                                LE
                                                                                                MAIL</span></span></a><!--[if mso]></center></v:textbox></v:roundrect><![endif]--></div>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table class="row row-4" align="center" width="100%"
                                        border="0" cellpadding="0" cellspacing="0"
                                        role="presentation"
                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <table class="row-content stack"
                                                        align="center" border="0"
                                                        cellpadding="0" cellspacing="0"
                                                        role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-image: url('https://d1oco4z2z1fhwp.cloudfront.net/templates/default/7836/Header-bg.png'); background-repeat: no-repeat; background-size: cover; border-radius: 0; color: #000000; background-color: #efeef4; width: 700px; margin: 0 auto;"
                                                        width="700">
                                                        <tbody>
                                                            <tr>
                                                                <td class="column column-1"
                                                                    width="100%"
                                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 25px; padding-left: 10px; padding-right: 10px; padding-top: 25px; vertical-align: middle; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                    <div
                                                                        class="spacer_block block-1"
                                                                        style="height:60px;line-height:60px;font-size:1px;">&#8202;</div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table class="row row-13" align="center" width="100%"
                                        border="0" cellpadding="0" cellspacing="0"
                                        role="presentation"
                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <table class="row-content stack"
                                                        align="center" border="0"
                                                        cellpadding="0" cellspacing="0"
                                                        role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;  background-repeat: no-repeat; background-size: cover; background-color: #003300; border-radius: 0; color: #000000; width: 700px; margin: 0 auto;"
                                                        width="700">
                                                        <tbody>
                                                            <tr>
                                                                <td class="column column-1"
                                                                    width="50%"
                                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 40px; padding-left: 25px; padding-right: 25px; padding-top: 40px; vertical-align: middle; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                    <table
                                                                        class="heading_block block-1"
                                                                        width="100%"
                                                                        border="0"
                                                                        cellpadding="0"
                                                                        cellspacing="0"
                                                                        role="presentation"
                                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                        <tr>
                                                                            <td class="pad"
                                                                                style="padding-bottom:5px;padding-left:10px;padding-top:5px;text-align:center;width:100%;">
                                                                                <h1
                                                                                    style="margin: 0; color: #ffffff; direction: ltr; font-family: 'Noto Serif', Georgia, serif; font-size: 40px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: left; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 48px;"><span
                                                                                        class="tinyMce-placeholder">Pour
                                                                                        plus
                                                                                        d'informations<br></span></h1>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                                <td class="column column-2"
                                                                    width="50%"
                                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 40px; padding-left: 25px; padding-right: 25px; padding-top: 40px; vertical-align: middle; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                    <table
                                                                        class="paragraph_block block-1"
                                                                        width="100%"
                                                                        border="0"
                                                                        cellpadding="0"
                                                                        cellspacing="0"
                                                                        role="presentation"
                                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                        <tr>
                                                                            <td class="pad"
                                                                                style="padding-right:10px;">
                                                                                <div
                                                                                    style="color:#ffffff;direction:ltr;font-family:Inter, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:right;mso-line-height-alt:19.2px;">
                                                                                    <p
                                                                                        style="margin: 0;"><a
                                                                                            href="mailto:mukulima.app@gmail.com"
                                                                                            target="_blank"
                                                                                            style="text-decoration: underline; color: #ffffff;"
                                                                                            rel="noopener"><u>Nous
                                                                                                contacter
                                                                                            </u>
                                                                                            -&gt;</a></p>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table class="row row-14" align="center" width="100%"
                                        border="0" cellpadding="0" cellspacing="0"
                                        role="presentation"
                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-size: auto;">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <table class="row-content stack"
                                                        align="center" border="0"
                                                        cellpadding="0" cellspacing="0"
                                                        role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; background-size: auto; background-color: #201f42; width: 700px; margin: 0 auto;"
                                                        width="700">
                                                        <tbody>
                                                            <tr>
                                                                <td class="column column-1"
                                                                    width="33.333333333333336%"
                                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 20px; padding-left: 30px; padding-right: 10px; padding-top: 20px; vertical-align: middle; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                    <table
                                                                        class="image_block block-1"
                                                                        width="100%"
                                                                        border="0"
                                                                        cellpadding="0"
                                                                        cellspacing="0"
                                                                        role="presentation"
                                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                        <tr>
                                                                            <td class="pad"
                                                                                style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                <div
                                                                                    class="alignment"
                                                                                    align="center"
                                                                                    style="line-height:10px">
                                                                                    <div
                                                                                        style="max-width: 60.66666666666663px;"><a
                                                                                            href="https://mukulima.com"
                                                                                            target="_blank"
                                                                                            style="outline:none"
                                                                                            tabindex="-1"><img
                                                                                                src="https://backend.mukulima.com/assets/s/fblanc.png"
                                                                                                style="display: block; height: auto; border: 0; width: 100%;"
                                                                                                width="154.66666666666663"
                                                                                                alt="Mukulima"
                                                                                                title="Mukulima"></a></div>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                                <td class="column column-2"
                                                                    width="66.66666666666667%"
                                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-left: 25px; padding-right: 30px; padding-top: 5px; vertical-align: middle; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                    <table
                                                                        class="paragraph_block block-1"
                                                                        width="100%"
                                                                        border="0"
                                                                        cellpadding="0"
                                                                        cellspacing="0"
                                                                        role="presentation"
                                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                        <tr>
                                                                            <td class="pad">
                                                                                <div
                                                                                    style="color:#ffffff;direction:ltr;font-family:Inter, sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:right;mso-line-height-alt:16.8px;">
                                                                                    <p
                                                                                        style="margin: 0;">Copyright
                                                                                        ©
                                                                                        2024
                                                                                        Mukulima
                                                                                        App</p>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table class="row row-15" align="center" width="100%"
                                        border="0" cellpadding="0" cellspacing="0"
                                        role="presentation"
                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <table class="row-content stack"
                                                        align="center" border="0"
                                                        cellpadding="0" cellspacing="0"
                                                        role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 700px; margin: 0 auto;"
                                                        width="700">
                                                        <tbody>
                                                            <tr>
                                                                <td class="column column-1"
                                                                    width="100%"
                                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                    <table
                                                                        class="icons_block block-1"
                                                                        width="100%"
                                                                        border="0"
                                                                        cellpadding="0"
                                                                        cellspacing="0"
                                                                        role="presentation"
                                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                        <tr>
                                                                            <td class="pad"
                                                                                style="vertical-align: middle; color: #1e0e4b; font-family: 'Inter', sans-serif; font-size: 15px; padding-bottom: 5px; padding-top: 5px; text-align: center;">
                                                                                <table
                                                                                    width="100%"
                                                                                    cellpadding="0"
                                                                                    cellspacing="0"
                                                                                    role="presentation"
                                                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                    <tr>
                                                                                        <td
                                                                                            class="alignment"
                                                                                            style="vertical-align: middle; text-align: center;"><!--[if vml]><table align="center" cellpadding="0" cellspacing="0" role="presentation" style="display:inline-block;padding-left:0px;padding-right:0px;mso-table-lspace: 0pt;mso-table-rspace: 0pt;"><![endif]-->
                                                                                            <!--[if !vml]><!-->
                                                                                            <table
                                                                                                class="icons-inner"
                                                                                                style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block; margin-right: -4px; padding-left: 0px; padding-right: 0px;"
                                                                                                cellpadding="0"
                                                                                                cellspacing="0"
                                                                                                role="presentation"><!--<![endif]-->
                                                                                                <tr>
                                                                                                    <td
                                                                                                        style="vertical-align: middle; text-align: center; padding-top: 5px; padding-bottom: 5px; padding-left: 5px; padding-right: 6px;"><a
                                                                                                            href="https://mukulima.com/"
                                                                                                            target="_blank"
                                                                                                            style="text-decoration: none;"><img
                                                                                                                class="icon"
                                                                                                                alt="Mukulima Logo"
                                                                                                                src="https://backend.mukulima.com/assets/s/fgreen.png"
                                                                                                                height="32"
                                                                                                                width="34"
                                                                                                                align="center"
                                                                                                                style="display: block; height: auto; margin: 0 auto; border: 0;"></a></td>
                                                                                                    <td
                                                                                                        style="font-family: 'Inter', sans-serif; font-size: 15px; font-weight: undefined; color: #1e0e4b; vertical-align: middle; letter-spacing: undefined; text-align: center;"><a
                                                                                                            href="https://mukulima.com/"
                                                                                                            target="_blank"
                                                                                                            style="color: #1e0e4b; text-decoration: none;">Mukulima
                                                                                                            App</a></td>
                                                                                                </tr>
                                                                                            </table>
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table><!-- End -->
                </body>
            
            </html>`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('====================================');
                console.log(error);
                console.log('====================================');
                return cb(undefined, { code: 500, message: "error", data: error });
            }
            else {
                return cb(undefined, { code: 200, message: "Email sent", data: info });
            }
        });
    }),
    onSendMail: ({ cb, to, content: { fullname, confirmationlink } }) => __awaiter(void 0, void 0, void 0, function* () {
        cb = cb ? cb : () => { };
        fullname = (0, helper_all_1.capitalizeWords)({ text: fullname });
        const transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: 'mukulima.app@gmail.com',
                pass: 'zusa tcto irad zvqb' || 'fesx oblh dadb zwwo' || 'Mukulima@2002'
            }
        });
        const mailOptions = {
            from: 'Mukulima App, mukulima.app@gmail.com',
            to,
            subject: 'Configuration',
            html: `<!DOCTYPE html>
            <html xmlns:v="urn:schemas-microsoft-com:vml"
                xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
            
                <head>
                    <title></title>
                    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                    <meta name="viewport"
                        content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--[if !mso]><!-->
                    <link href="https://fonts.googleapis.com/css?family=Noto+Serif"
                        rel="stylesheet" type="text/css">
                    <link
                        href="https://fonts.googleapis.com/css2?family=Inter&amp;family=Work+Sans:wght@700&amp;display=swap"
                        rel="stylesheet" type="text/css"><!--<![endif]-->
                    <style>
                    * {
                        box-sizing: border-box;
                    }
            
                    body {
                        margin: 0;
                        padding: 0;
                    }
            
                    a[x-apple-data-detectors] {
                        color: inherit !important;
                        text-decoration: inherit !important;
                    }
            
                    #MessageViewBody a {
                        color: inherit;
                        text-decoration: none;
                    }
            
                    p {
                        line-height: inherit
                    }
            
                    .desktop_hide,
                    .desktop_hide table {
                        mso-hide: all;
                        display: none;
                        max-height: 0px;
                        overflow: hidden;
                    }
            
                    .image_block img+div {
                        display: none;
                    }
            
                    @media (max-width:720px) {
                        .desktop_hide table.icons-inner {
                            display: inline-block !important;
                        }
            
                        .icons-inner {
                            text-align: center;
                        }
            
                        .icons-inner td {
                            margin: 0 auto;
                        }
            
                        .mobile_hide {
                            display: none;
                        }
            
                        .row-content {
                            width: 100% !important;
                        }
            
                        .stack .column {
                            width: 100%;
                            display: block;
                        }
            
                        .mobile_hide {
                            min-height: 0;
                            max-height: 0;
                            max-width: 0;
                            overflow: hidden;
                            font-size: 0px;
                        }
            
                        .desktop_hide,
                        .desktop_hide table {
                            display: table !important;
                            max-height: none !important;
                        }
            
                        .row-13 .column-1 .block-1.heading_block h1,
                        .row-13 .column-2 .block-1.paragraph_block td.pad>div,
                        .row-14 .column-2 .block-1.paragraph_block td.pad>div,
                        .row-2 .column-2 .block-1.paragraph_block td.pad>div,
                        .row-3 .column-1 .block-4.heading_block h1,
                        .row-6 .column-2 .block-1.heading_block h1,
                        .row-6 .column-2 .block-2.heading_block h1,
                        .row-6 .column-2 .block-3.paragraph_block td.pad>div,
                        .row-7 .column-2 .block-1.heading_block h1,
                        .row-7 .column-2 .block-2.heading_block h1,
                        .row-7 .column-2 .block-3.paragraph_block td.pad>div {
                            text-align: center !important;
                        }
            
                        .row-13 .column-2 .block-1.paragraph_block td.pad {
                            padding: 0 !important;
                        }
            
                        .row-14 .column-1,
                        .row-2 .column-1,
                        .row-4 .column-1,
                        .row-9 .column-1 {
                            padding: 20px 10px !important;
                        }
            
                        .row-2 .column-2 {
                            padding: 5px 25px 20px !important;
                        }
            
                        .row-6 .column-1,
                        .row-7 .column-1 {
                            padding: 15px 25px 0 !important;
                        }
            
                        .row-6 .column-2,
                        .row-7 .column-2 {
                            padding: 15px 20px 25px !important;
                        }
            
                        .row-10 .column-1 {
                            padding: 40px 20px !important;
                        }
            
                        .row-12 .column-1 {
                            padding: 0 20px 40px !important;
                        }
            
                        .row-13 .column-1 {
                            padding: 40px 25px 25px !important;
                        }
            
                        .row-13 .column-2 {
                            padding: 5px 25px 40px !important;
                        }
            
                        .row-14 .column-2 {
                            padding: 5px 30px 20px 25px !important;
                        }
                    }
                </style>
                </head>
            
                <body
                    style="background-color: #f7f7f7; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
                    <table class="nl-container" width="100%" border="0" cellpadding="0"
                        cellspacing="0" role="presentation"
                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f7f7f7;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row row-1" align="center" width="100%"
                                        border="0" cellpadding="0" cellspacing="0"
                                        role="presentation"
                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <table class="row-content stack"
                                                        align="center" border="0"
                                                        cellpadding="0" cellspacing="0"
                                                        role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; width: 700px; margin: 0 auto;"
                                                        width="700">
                                                        <tbody>
                                                            <tr>
                                                                <td class="column column-1"
                                                                    width="100%"
                                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                    <div
                                                                        class="spacer_block block-1"
                                                                        style="height:15px;line-height:15px;font-size:1px;">&#8202;</div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table class="row row-3" align="center" width="100%"
                                        border="0" cellpadding="0" cellspacing="0"
                                        role="presentation"
                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <table class="row-content stack"
                                                        align="center" border="0"
                                                        cellpadding="0" cellspacing="0"
                                                        role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #efeef4; border-bottom: 0 solid #EFEEF4; border-left: 0 solid #EFEEF4; border-right: 0px solid #EFEEF4; border-top: 0 solid #EFEEF4; color: #000000; width: 700px; margin: 0 auto;"
                                                        width="700">
                                                        <tbody>
                                                            <tr>
                                                                <td class="column column-1"
                                                                    width="100%"
                                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 25px; padding-left: 25px; padding-right: 25px; padding-top: 35px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                    <table
                                                                        class="icons_block block-1"
                                                                        width="100%"
                                                                        border="0"
                                                                        cellpadding="0"
                                                                        cellspacing="0"
                                                                        role="presentation"
                                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                        <tr>
                                                                            <td class="pad"
                                                                                style="vertical-align: middle; color: #4f5aba; font-family: 'Noto Serif', Georgia, serif; font-size: 24px; letter-spacing: 0px; padding-bottom: 10px; padding-top: 10px; text-align: center;">
                                                                                <table
                                                                                    class="alignment"
                                                                                    cellpadding="0"
                                                                                    cellspacing="0"
                                                                                    role="presentation"
                                                                                    align="center"
                                                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                    <tr>
                                                                                        <td
                                                                                            style="vertical-align: middle; text-align: center; padding-top: 0px; padding-bottom: 0px; padding-left: 20px; padding-right: 20px;"><a
                                                                                                href="https://mukulima.com"
                                                                                                target="_self"
                                                                                                style="text-decoration: none;"><img
                                                                                                    class="icon"
                                                                                                    src="https://backend.mukulima.com/assets/s/fgreen.png"
                                                                                                    alt="new year celebration"
                                                                                                    height="128"
                                                                                                    width="109"
                                                                                                    align="center"
                                                                                                    style="display: block; height: auto; margin: 0 auto; border: 0;"></a></td>
                                                                                    </tr>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                    <table
                                                                        class="heading_block block-2"
                                                                        width="100%"
                                                                        border="0"
                                                                        cellpadding="0"
                                                                        cellspacing="0"
                                                                        role="presentation"
                                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                        <tr>
                                                                            <td class="pad"
                                                                                style="padding-top:10px;text-align:center;width:100%;">
                                                                                <h1
                                                                                    style="margin: 0; color: #003300; direction: ltr; font-family: 'Noto Serif', Georgia, serif; font-size: 41px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 49.199999999999996px;"><span
                                                                                        class="tinyMce-placeholder">FELICITATION&nbsp;</span></h1>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                    <table
                                                                        class="heading_block block-3"
                                                                        width="100%"
                                                                        border="0"
                                                                        cellpadding="0"
                                                                        cellspacing="0"
                                                                        role="presentation"
                                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                        <tr>
                                                                            <td class="pad"
                                                                                style="padding-bottom:10px;padding-top:10px;text-align:center;width:100%;">
                                                                                <h2
                                                                                    style="margin: 0; color: #201f42; direction: ltr; font-family: 'Noto Serif', Georgia, serif; font-size: 24px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 28.799999999999997px;">${fullname}</h2>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                    <table
                                                                        class="heading_block block-4"
                                                                        width="100%"
                                                                        border="0"
                                                                        cellpadding="10"
                                                                        cellspacing="0"
                                                                        role="presentation"
                                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                        <!-- <tr>
                                                                            <td class="pad">
                                                                                <h1
                                                                                    style="margin: 0; color: #201f42; direction: ltr; font-family: Inter, sans-serif; font-size: 18px; font-weight: 400; letter-spacing: normal; line-height: 150%; text-align: center; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 27px;"><span
                                                                                        class="tinyMce-placeholder">DECEMBER
                                                                                        18TH
                                                                                        2023<br>7:00
                                                                                        -
                                                                                        9:30
                                                                                        PM<br></span></h1>
                                                                            </td>
                                                                        </tr> -->
                                                                    </table>
                                                                    <table
                                                                        class="paragraph_block block-5"
                                                                        width="100%"
                                                                        border="0"
                                                                        cellpadding="0"
                                                                        cellspacing="0"
                                                                        role="presentation"
                                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                        <tr>
                                                                            <td class="pad"
                                                                                style="padding-left:10px;padding-right:10px;">
                                                                                <div
                                                                                    style="color:#201f42;direction:ltr;font-family:Inter, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:180%;text-align:center;mso-line-height-alt:28.8px;">
                                                                                    <p
                                                                                        style="margin: 0;">Nous
                                                                                        sommes
                                                                                        ravis
                                                                                        de
                                                                                        vous
                                                                                        accueillir
                                                                                        chez
                                                                                        {APPNAME}
                                                                                        !
                                                                                        Merci
                                                                                        de
                                                                                        choisir
                                                                                        notre
                                                                                        service.
            
                                                                                        Pour
                                                                                        finaliser
                                                                                        votre
                                                                                        inscription,
                                                                                        veuillez
                                                                                        confirmer
                                                                                        votre
                                                                                        adresse
                                                                                        e-mail
                                                                                        en
                                                                                        cliquant
                                                                                        sur
                                                                                        le
                                                                                        lien
                                                                                        ci-dessous
                                                                                        :
            
                                                                                        [${confirmationlink}]
            
                                                                                        Cette
                                                                                        étape
                                                                                        est
                                                                                        cruciale
                                                                                        pour
                                                                                        garantir
                                                                                        la
                                                                                        sécurité
                                                                                        de
                                                                                        votre
                                                                                        compte
                                                                                        et
                                                                                        vous
                                                                                        tenir
                                                                                        informé(e)
                                                                                        de
                                                                                        toutes
                                                                                        les
                                                                                        mises
                                                                                        à
                                                                                        jour
                                                                                        importantes.
                                                                                        En
                                                                                        cas
                                                                                        de
                                                                                        problème,
                                                                                        n'hésitez
                                                                                        pas
                                                                                        à
                                                                                        nous
                                                                                        contacter
                                                                                        à
                                                                                        [{MAILAPP}].
            
                                                                                        Nous
                                                                                        sommes
                                                                                        impatients
                                                                                        de
                                                                                        vous
                                                                                        offrir
                                                                                        la
                                                                                        meilleure
                                                                                        expérience
                                                                                        possible.
            
                                                                                        Cordialement&nbsp;</p>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                    <table
                                                                        class="button_block block-6"
                                                                        width="100%"
                                                                        border="0"
                                                                        cellpadding="0"
                                                                        cellspacing="0"
                                                                        role="presentation"
                                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                        <tr>
                                                                            <td class="pad"
                                                                                style="padding-bottom:15px;padding-top:20px;text-align:center;">
                                                                                <div
                                                                                    class="alignment"
                                                                                    align="center"><a
                                                                                        href
                                                                                        target="_blank"
                                                                                        style="text-decoration:none;display:inline-block;color:#ffffff;background-color:#003300;border-radius:0px;width:auto;border-top:1px solid #201F42;font-weight:400;border-right:1px solid #201F42;border-bottom:1px solid #201F42;border-left:1px solid #201F42;padding-top:5px;padding-bottom:5px;font-family:'Noto Serif', Georgia, serif;font-size:16px;text-align:center;mso-border-alt:none;word-break:keep-all;"><span
                                                                                            style="padding-left:30px;padding-right:30px;font-size:16px;display:inline-block;letter-spacing:normal;"><span
                                                                                                style="word-break: break-word; line-height: 32px;">CONFIRMER
                                                                                                LE
                                                                                                MAIL</span></span></a><!--[if mso]></center></v:textbox></v:roundrect><![endif]--></div>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table class="row row-4" align="center" width="100%"
                                        border="0" cellpadding="0" cellspacing="0"
                                        role="presentation"
                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <table class="row-content stack"
                                                        align="center" border="0"
                                                        cellpadding="0" cellspacing="0"
                                                        role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-image: url('https://d1oco4z2z1fhwp.cloudfront.net/templates/default/7836/Header-bg.png'); background-repeat: no-repeat; background-size: cover; border-radius: 0; color: #000000; background-color: #efeef4; width: 700px; margin: 0 auto;"
                                                        width="700">
                                                        <tbody>
                                                            <tr>
                                                                <td class="column column-1"
                                                                    width="100%"
                                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 25px; padding-left: 10px; padding-right: 10px; padding-top: 25px; vertical-align: middle; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                    <div
                                                                        class="spacer_block block-1"
                                                                        style="height:60px;line-height:60px;font-size:1px;">&#8202;</div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table class="row row-13" align="center" width="100%"
                                        border="0" cellpadding="0" cellspacing="0"
                                        role="presentation"
                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <table class="row-content stack"
                                                        align="center" border="0"
                                                        cellpadding="0" cellspacing="0"
                                                        role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;  background-repeat: no-repeat; background-size: cover; background-color: #003300; border-radius: 0; color: #000000; width: 700px; margin: 0 auto;"
                                                        width="700">
                                                        <tbody>
                                                            <tr>
                                                                <td class="column column-1"
                                                                    width="50%"
                                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 40px; padding-left: 25px; padding-right: 25px; padding-top: 40px; vertical-align: middle; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                    <table
                                                                        class="heading_block block-1"
                                                                        width="100%"
                                                                        border="0"
                                                                        cellpadding="0"
                                                                        cellspacing="0"
                                                                        role="presentation"
                                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                        <tr>
                                                                            <td class="pad"
                                                                                style="padding-bottom:5px;padding-left:10px;padding-top:5px;text-align:center;width:100%;">
                                                                                <h1
                                                                                    style="margin: 0; color: #ffffff; direction: ltr; font-family: 'Noto Serif', Georgia, serif; font-size: 40px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: left; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 48px;"><span
                                                                                        class="tinyMce-placeholder">Pour
                                                                                        plus
                                                                                        d'informations<br></span></h1>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                                <td class="column column-2"
                                                                    width="50%"
                                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 40px; padding-left: 25px; padding-right: 25px; padding-top: 40px; vertical-align: middle; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                    <table
                                                                        class="paragraph_block block-1"
                                                                        width="100%"
                                                                        border="0"
                                                                        cellpadding="0"
                                                                        cellspacing="0"
                                                                        role="presentation"
                                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                        <tr>
                                                                            <td class="pad"
                                                                                style="padding-right:10px;">
                                                                                <div
                                                                                    style="color:#ffffff;direction:ltr;font-family:Inter, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:right;mso-line-height-alt:19.2px;">
                                                                                    <p
                                                                                        style="margin: 0;"><a
                                                                                            href="mailto:mukulima.app@gmail.com"
                                                                                            target="_blank"
                                                                                            style="text-decoration: underline; color: #ffffff;"
                                                                                            rel="noopener"><u>Nous
                                                                                                contacter
                                                                                            </u>
                                                                                            -&gt;</a></p>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table class="row row-14" align="center" width="100%"
                                        border="0" cellpadding="0" cellspacing="0"
                                        role="presentation"
                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-size: auto;">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <table class="row-content stack"
                                                        align="center" border="0"
                                                        cellpadding="0" cellspacing="0"
                                                        role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; background-size: auto; background-color: #201f42; width: 700px; margin: 0 auto;"
                                                        width="700">
                                                        <tbody>
                                                            <tr>
                                                                <td class="column column-1"
                                                                    width="33.333333333333336%"
                                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 20px; padding-left: 30px; padding-right: 10px; padding-top: 20px; vertical-align: middle; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                    <table
                                                                        class="image_block block-1"
                                                                        width="100%"
                                                                        border="0"
                                                                        cellpadding="0"
                                                                        cellspacing="0"
                                                                        role="presentation"
                                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                        <tr>
                                                                            <td class="pad"
                                                                                style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                <div
                                                                                    class="alignment"
                                                                                    align="center"
                                                                                    style="line-height:10px">
                                                                                    <div
                                                                                        style="max-width: 60.66666666666663px;"><a
                                                                                            href="https://mukulima.com"
                                                                                            target="_blank"
                                                                                            style="outline:none"
                                                                                            tabindex="-1"><img
                                                                                                src="https://backend.mukulima.com/assets/s/fblanc.png"
                                                                                                style="display: block; height: auto; border: 0; width: 100%;"
                                                                                                width="154.66666666666663"
                                                                                                alt="Mukulima"
                                                                                                title="Mukulima"></a></div>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                                <td class="column column-2"
                                                                    width="66.66666666666667%"
                                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-left: 25px; padding-right: 30px; padding-top: 5px; vertical-align: middle; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                    <table
                                                                        class="paragraph_block block-1"
                                                                        width="100%"
                                                                        border="0"
                                                                        cellpadding="0"
                                                                        cellspacing="0"
                                                                        role="presentation"
                                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                        <tr>
                                                                            <td class="pad">
                                                                                <div
                                                                                    style="color:#ffffff;direction:ltr;font-family:Inter, sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:right;mso-line-height-alt:16.8px;">
                                                                                    <p
                                                                                        style="margin: 0;">Copyright
                                                                                        ©
                                                                                        2024
                                                                                        Mukulima
                                                                                        App</p>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table class="row row-15" align="center" width="100%"
                                        border="0" cellpadding="0" cellspacing="0"
                                        role="presentation"
                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <table class="row-content stack"
                                                        align="center" border="0"
                                                        cellpadding="0" cellspacing="0"
                                                        role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 700px; margin: 0 auto;"
                                                        width="700">
                                                        <tbody>
                                                            <tr>
                                                                <td class="column column-1"
                                                                    width="100%"
                                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                    <table
                                                                        class="icons_block block-1"
                                                                        width="100%"
                                                                        border="0"
                                                                        cellpadding="0"
                                                                        cellspacing="0"
                                                                        role="presentation"
                                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                        <tr>
                                                                            <td class="pad"
                                                                                style="vertical-align: middle; color: #1e0e4b; font-family: 'Inter', sans-serif; font-size: 15px; padding-bottom: 5px; padding-top: 5px; text-align: center;">
                                                                                <table
                                                                                    width="100%"
                                                                                    cellpadding="0"
                                                                                    cellspacing="0"
                                                                                    role="presentation"
                                                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                    <tr>
                                                                                        <td
                                                                                            class="alignment"
                                                                                            style="vertical-align: middle; text-align: center;"><!--[if vml]><table align="center" cellpadding="0" cellspacing="0" role="presentation" style="display:inline-block;padding-left:0px;padding-right:0px;mso-table-lspace: 0pt;mso-table-rspace: 0pt;"><![endif]-->
                                                                                            <!--[if !vml]><!-->
                                                                                            <table
                                                                                                class="icons-inner"
                                                                                                style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block; margin-right: -4px; padding-left: 0px; padding-right: 0px;"
                                                                                                cellpadding="0"
                                                                                                cellspacing="0"
                                                                                                role="presentation"><!--<![endif]-->
                                                                                                <tr>
                                                                                                    <td
                                                                                                        style="vertical-align: middle; text-align: center; padding-top: 5px; padding-bottom: 5px; padding-left: 5px; padding-right: 6px;"><a
                                                                                                            href="https://mukulima.com/"
                                                                                                            target="_blank"
                                                                                                            style="text-decoration: none;"><img
                                                                                                                class="icon"
                                                                                                                alt="Mukulima Logo"
                                                                                                                src="https://backend.mukulima.com/assets/s/fgreen.png"
                                                                                                                height="32"
                                                                                                                width="34"
                                                                                                                align="center"
                                                                                                                style="display: block; height: auto; margin: 0 auto; border: 0;"></a></td>
                                                                                                    <td
                                                                                                        style="font-family: 'Inter', sans-serif; font-size: 15px; font-weight: undefined; color: #1e0e4b; vertical-align: middle; letter-spacing: undefined; text-align: center;"><a
                                                                                                            href="https://mukulima.com/"
                                                                                                            target="_blank"
                                                                                                            style="color: #1e0e4b; text-decoration: none;">Mukulima
                                                                                                            App</a></td>
                                                                                                </tr>
                                                                                            </table>
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table><!-- End -->
                </body>
            
            </html>`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return cb(undefined, { code: 500, message: "error", data: error });
            }
            else {
                return cb(undefined, { code: 200, message: "Email sent", data: info });
            }
        });
    }),
    addRoleToUser: ({ inputs: { iduser, idroles }, transaction, cb }) => __awaiter(void 0, void 0, void 0, function* () {
        if (!iduser || !idroles)
            return cb(undefined, { code: 401, message: "This request must have at least !", data: { idroles, iduser } });
        try {
            if (Array.isArray(idroles)) {
                const done = [];
                for (let role of idroles) {
                    const r = yield model_hasroles_1.Hasroles.create({
                        id: parseInt((0, helper_random_1.randomLongNumber)({ length: 6 })),
                        TblEcomRoleId: role,
                        TblEcomUserId: iduser
                    }, { transaction });
                    done.push(r);
                }
                return cb(undefined, { code: 200, message: "Done", data: done });
            }
        }
        catch (error) {
            return cb(undefined, { code: 500, message: "Error", data: error.toString() });
        }
    }),
    onGenerateCardMember: ({ id_user, id_cooperative }) => __awaiter(void 0, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const expiresIn = (0, helper_moment_1.addDaysThenReturnUnix)({ days: 365 });
            const expiresInDate = (0, helper_moment_1.unixToDate)({ unix: expiresIn });
            let card = expiresIn.toString().concat(".").concat(id_user.toString()).concat(".").concat(id_cooperative.toString());
            let tr = card;
            for (let index = 0; index < middleware_cookies_1.tries; index++) {
                tr = base_64_1.default.encode(tr);
            }
            if (card)
                resolve({ code: 200, message: "Card created as expiresIn.id_user.id_cooperative", data: { card: tr, expiresInString: expiresInDate, expiresInUnix: expiresIn } });
            else
                reject({ code: 500, message: " --- can not encode card ", data: {} });
        });
    }),
    addMembersToCoopec: ({ inputs: { idmembers, idcooperative, expiresIn, expiresInUnix, card }, transaction, cb }) => __awaiter(void 0, void 0, void 0, function* () {
        if (!idmembers || !idcooperative)
            return cb(undefined, { code: 401, message: "This request must have at least !", data: { idmembers, idcooperative } });
        try {
            if (Array.isArray(idmembers)) {
                const done = [];
                for (let member of idmembers) {
                    const r = yield model_hasmembers_1.Hasmembers.create({
                        id: parseInt((0, helper_random_1.randomLongNumber)({ length: 6 })),
                        TblEcomCooperativeId: idcooperative,
                        TblEcomUserId: member,
                        carte: card,
                        date_expiration: expiresIn,
                        date_expiration_unix: expiresInUnix
                    }, { transaction });
                    done.push(r);
                }
                return cb(undefined, { code: 200, message: "Done", data: done });
            }
        }
        catch (error) {
            return cb(undefined, { code: 500, message: "Error", data: error });
        }
    }),
    addMemberToCoopec: ({ inputs, transaction, cb }) => __awaiter(void 0, void 0, void 0, function* () {
        (0, console_1.log)("+++++++++++======>", inputs);
        const { idmember, idcooperative, card, expiresIn, expiresInUnix } = inputs;
        if (!idmember || !idcooperative)
            return cb(undefined, { code: 401, message: "This request must have at least !", data: { idmember, idcooperative } });
        try {
            if (idmember) {
                const member = yield model_hasmembers_1.Hasmembers.create({
                    id: parseInt((0, helper_random_1.randomLongNumber)({ length: 6 })),
                    TblEcomCooperativeId: idcooperative,
                    TblEcomUserId: idmember,
                    carte: card,
                    date_expiration: expiresIn,
                    date_expiration_unix: expiresInUnix
                }, { transaction });
                if (member instanceof model_hasmembers_1.Hasmembers) {
                    return cb(undefined, { code: 200, message: "Done", data: member });
                }
                else
                    return cb(undefined, { code: 500, message: "Error", data: null });
            }
        }
        catch (error) {
            return cb(undefined, { code: 500, message: "Error", data: error });
        }
    }),
    rawRolesAsTableOfIds: () => __awaiter(void 0, void 0, void 0, function* () {
        const { count, rows } = yield model_roles_1.Roles.findAndCountAll({ where: {}, raw: true, attributes: ['id'] });
        if (count <= 0)
            return [];
        else {
            return rows.map(r => r && r['id']);
        }
    }),
    rawProvincesAsTableOfIds: () => __awaiter(void 0, void 0, void 0, function* () {
        const { count, rows } = yield model_provinces_1.Provinces.findAndCountAll({ where: {}, raw: true, attributes: ['id'] });
        if (count <= 0)
            return [];
        else {
            return rows.map(r => r && r['id']);
        }
    }),
    rawTerritoiresAsTableOfIds: ({ idprovince }) => __awaiter(void 0, void 0, void 0, function* () {
        const { count, rows } = yield model_territoires_1.Territoires.findAndCountAll({ where: { idprovince }, raw: true, attributes: ['id'] });
        if (count <= 0)
            return [];
        else {
            return rows.map(r => r && r['id']);
        }
    }),
    rawUsersAsTableOfIds: () => __awaiter(void 0, void 0, void 0, function* () {
        const { count, rows } = yield model_users_1.Users.findAndCountAll({ where: {}, raw: true, attributes: ['id'] });
        if (count <= 0)
            return [];
        else {
            return rows.map(r => r && r['id']);
        }
    }),
    rawVillagesAsTableOfIds: ({ idterritoire }) => __awaiter(void 0, void 0, void 0, function* () {
        const { count, rows } = yield model_villages_1.Villages.findAndCountAll({ where: {}, raw: true, attributes: ['id'] });
        if (count <= 0)
            return [];
        else {
            return rows.map(r => r && r['id']);
        }
    }),
    uploadfile: ({ inputs: { file, type, saveas } }) => __awaiter(void 0, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            if (!file || !type)
                return reject({ code: 401, message: "This request must have at least file, and type of file !", data: { file, type } });
            try {
                tempfolder = saveas || tempfolder;
                const __file = file['files'][type];
                const filename = (0, helper_random_1.generateFilename)({ prefix: type, tempname: __file['name'] });
                const uploadPath = 'src/__assets/' + tempfolder + '/' + filename;
                __file.mv(uploadPath, function (err) {
                    if (err)
                        return reject({ code: 500, message: "An error was occured when trying to upload file", data: err });
                    else {
                        const slink = String(uploadPath).substring(String(uploadPath).indexOf("/") + 1);
                        return resolve({ code: 200, message: "File uploaded done", data: { filename, fullpath: slink } });
                    }
                });
            }
            catch (error) {
                return reject({ code: 500, message: "An error was occured !", data: error });
            }
        });
    })
};
