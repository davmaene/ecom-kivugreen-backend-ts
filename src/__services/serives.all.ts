import { tries } from './../__middlewares/middleware.cookies';
import dotenv from 'dotenv';
import axios from 'axios';
import { Hasroles } from '../__models/model.hasroles';
import { generateFilename, randomLongNumber } from '../__helpers/helper.random';
import { capitalizeWords } from '../__helpers/helper.all';
import nodemailer from 'nodemailer';
import { Roles } from '../__models/model.roles';
import { Provinces } from '../__models/model.provinces';
import { Territoires } from '../__models/model.territoires';
import { Villages } from '../__models/model.villages';
import { completeCodeCountryToPhoneNumber, fillphone } from '../__helpers/helper.fillphone';
import { log } from 'console';
import { Users } from '../__models/model.users';
import { Hasmembers } from '../__models/model.hasmembers';
import fs from 'fs';
import { Configs } from '../__models/model.configs';
import { addDaysThenReturnUnix, unixToDate } from '../__helpers/helper.moment';
import base64 from 'base-64';
import { NextFunction, Request, Response } from 'express';
import { Responder } from '../__helpers/helper.responseserver';
import { HttpStatusCode } from '../__enums/enum.httpsstatuscode';
import { Scheduler } from './services.scheduler';
import { Payements } from './services.payements';
import { Commandes } from '../__models/model.commandes';
import { Hasproducts } from '../__models/model.hasproducts';
import { Cooperatives } from '../__models/model.cooperatives';
import { Stocks } from '../__models/model.stocks';
import { Unites } from '../__models/model.unitemesures';
import { Produits } from '../__models/model.produits';
import { connect } from '../__databases/connecte';
import { Categoriescooperatives } from '../__models/model.categscooperatives';

dotenv.config()

const { API_SMS_ENDPOINT, APP_NAME, API_SMS_TOKEN, API_SMS_IS_FLASH, APP_FLEXPAYRETROCOMMISIONNE } = process.env
if (!APP_FLEXPAYRETROCOMMISIONNE || !APP_NAME || !API_SMS_ENDPOINT) throw new Error

let tempfolder: string = 'as_assets'

export const Services = {
    calcProductPrice: async ({ unit_price, tva = 16 }: { unit_price: number, tva: number }) => {
        const configs = await Configs.findOne({
            where: {
                id: 1
            }
        })
        const { taux_change, commission_price } = configs?.toJSON() as any;
        const commission = unit_price * commission_price;
        const prixAvecCommission = unit_price + commission;
        const TVA = prixAvecCommission * (tva / 100);

        const prixTotal = prixAvecCommission + TVA;

        return prixTotal;
    },
    accomplishePayement: async ({ }) => {

    },
    placecommande: async ({ req, res, next, id_transaction }: { req: Request, res: Response, next: NextFunction, id_transaction: any }) => {
        const { currentuser } = req as any;
        const { __id, roles, uuid } = currentuser;
        const { items, type_livraison, payament_phone, currency_payement, shipped_to, retry } = req.body;
        const default_currency = "CDF"

        if (!items || !Array.isArray(items) || !type_livraison) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least items and can not be empty ! and type_livraison");
        if (type_livraison === 4) {
            if (!shipped_to) return Responder(res, HttpStatusCode.NotAcceptable, "please provide the shipped_to as addresse !")
        }
        try {
            const treated: any[] = []
            const c_treated: any[] = []
            const c_nottreated: any[] = []
            const nottreated: any[] = []
            const transaction = id_transaction || randomLongNumber({ length: 13 })
            const tr_ = await connect.transaction()
            const currentUser = await Users.findOne({
                where: {
                    id: __id
                }
            })

            if (currentUser instanceof Users) {
                const { phone, email, nom } = currentUser.toJSON() as any;
                for (let index = 0; index < Array.from(items).length; index++) {
                    const { id_produit, qte } = items[index];

                    Hasproducts.belongsTo(Produits) // , { foreignKey: 'TblEcomProduitId' }
                    Hasproducts.belongsTo(Unites) // , { foreignKey: 'TblEcomUnitesmesureId' }
                    Hasproducts.belongsTo(Stocks) // , { foreignKey: 'TblEcomStockId' }
                    Hasproducts.belongsTo(Cooperatives) // , { foreignKey: 'TblEcomCooperativeId' }

                    const has = await Hasproducts.findOne({
                        transaction: tr_,
                        include: [
                            {
                                model: Produits,
                                required: true,
                                attributes: ['id', 'produit', 'image', 'description']
                            },
                            {
                                model: Unites,
                                required: true,
                                attributes: ['id', 'unity', 'equival_kgs']
                            },
                            {
                                model: Stocks,
                                required: true,
                                attributes: ['id', 'transaction']
                            },
                            {
                                model: Cooperatives,
                                required: true,
                                attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'cooperative', 'sigle']
                            }
                        ],
                        where: {
                            id: id_produit
                        }
                    })

                    if (has instanceof Hasproducts) {
                        const { id, qte: asqte, prix_unitaire, currency, __tbl_ecom_produit, __tbl_ecom_unitesmesure, __tbl_ecom_stock, __tbl_ecom_cooperative, TblEcomProduitId } = has.toJSON() as any
                        if (qte <= asqte) {
                            treated.push({ ...has.toJSON(), qte })
                        } else {
                            nottreated.push({ item: has.toJSON() as any, message: `Commande received but the commanded qte is 'gt' the current store ! STORE:::${asqte} <==> QRY:::${qte}` })
                        }
                    } else {
                        nottreated.push({ item: items[index] as any, message: `Item can not be found !` })
                    }
                }

                if (treated.length > 0) {
                    const somme: number[] = [0, 0]
                    for (let index = 0; index < treated.length; index++) {
                        const { id, qte, prix_unitaire, currency, __tbl_ecom_cooperative, __tbl_ecom_stock, prix_plus_commission, __tbl_ecom_unitesmesure, __tbl_ecom_produit, tva, TblEcomProduitId }: any = treated[index] as any;
                        const { produit, id_unity } = __tbl_ecom_produit
                        const { unity } = __tbl_ecom_unitesmesure
                        const { id: id_cooperative } = __tbl_ecom_cooperative as any;
                        let price: number = (parseFloat(prix_plus_commission) * parseFloat(qte))
                        let { code, data, message } = await Services.converterDevise({ amount: price, currency: currency_payement ? currency_payement : currency });
                        if (code === 200) {
                            const { amount: converted_price, currency: converted_currency } = data
                            somme.push(converted_price)
                            if (retry && retry === true) {
                                c_treated.push({ currency: converted_currency, amount: converted_price, qte, unity, produit })
                            } else {
                                const cmmd = await Commandes.create({
                                    id_produit: TblEcomProduitId, //id,
                                    is_pending: 1,
                                    id_cooperative,
                                    id_unity,
                                    shipped_to: parseInt(type_livraison) === 4 ? shipped_to : "---",
                                    payament_phone: payament_phone || phone,
                                    currency: converted_currency,
                                    prix_total: converted_price,
                                    prix_unit: prix_unitaire,
                                    qte,
                                    state: 0,
                                    transaction,
                                    type_livraison,
                                    createdby: __id
                                }, { transaction: tr_ })
                                if (cmmd instanceof Commandes) c_treated.push({ currency: converted_currency, amount: converted_price, qte, unity, produit })
                            }
                        }
                    }

                    if (c_treated.length > 0) {

                        const currency_tobe_displayed = c_treated[0].currency
                        const amount_tobe_payed = c_treated.map(t => t.amount).concat([0, 0]).reduce((p, n) => parseFloat(p) + parseFloat(n));
                        const product_tobe_payed = c_treated.map(t => String(t.produit).concat(` ( ${t.qte}${t.unity},${t.amount}${t.currency} )`));

                        const ________ = () => {
                            Services.onSendSMS({
                                is_flash: false,
                                to: fillphone({ phone }),
                                content: `Bonjour ${nom} nous avons reçu votre commande de ${product_tobe_payed}, veuillez acceptez le paiement sur votre téléphone, montant à payer ${amount_tobe_payed}${currency_payement ? currency_payement : default_currency}, transID: ${transaction}`
                            })
                                .then(sms => { })
                                .catch((err: any) => { })

                            Payements.pay({
                                amount: somme.reduce((p, c) => p + c),
                                currency: currency_payement || default_currency,
                                phone: payament_phone || phone,
                                createdby: __id,
                                reference: transaction,
                                customer_phone: phone
                            })
                                .then(({ code, data, message }) => {
                                    if (code === 200) {
                                        Scheduler.checkPayement({ munites: 1, secondes: 45 })
                                        return Responder(res, HttpStatusCode.Ok, { id_transaction: transaction, prix_totale: somme.reduce((p, c) => p + c), currency: "CDF", c_treated, c_nottreated })
                                    } else {
                                        tr_.rollback()
                                        return Responder(res, HttpStatusCode.InternalServerError, { prix_totale: somme.reduce((p, c) => p + c), currency: "CDF", c_treated, c_nottreated })
                                    }
                                })
                                .catch(err => {
                                    return Responder(res, HttpStatusCode.Ok, { prix_totale: somme.reduce((p, c) => p + c), somme, c_treated, c_nottreated })
                                })
                            tr_.commit()
                        }

                        switch (currency_payement) {
                            case "USD":
                                if (amount_tobe_payed >= 1) {
                                    ________()
                                } else {
                                    Services.onSendSMS({
                                        is_flash: false,
                                        to: fillphone({ phone }),
                                        content: `Bonjour ${nom} nous n'acceptons pas des paiements de moins de 1USD, passez en CDF, transID: ${transaction}`
                                    })
                                        .then(sms => { })
                                        .catch((err: any) => { })
                                    tr_.rollback()
                                    return Responder(res, HttpStatusCode.NotAcceptable, `We can not process the commande cause amount ${amount_tobe_payed}${currency_tobe_displayed} is less than 1USD`)
                                }
                                break;
                            case "CDF":
                                ________()
                                break;
                            default:
                                tr_.rollback()
                                return Responder(res, HttpStatusCode.NotAcceptable, `We can not process the commande cause amount ${amount_tobe_payed}${currency_tobe_displayed} is less than 1USD`)
                                break;
                        }

                    } else {
                        tr_.rollback()
                        return Responder(res, HttpStatusCode.InternalServerError, "Commande can not be proceded cause the table of all commande is empty !")
                    }

                } else {
                    tr_.rollback()
                    return Responder(res, HttpStatusCode.InternalServerError, "Commande can not be proceded cause the table of all commande is empty !")
                }
            } else {
                tr_.rollback()
                return Responder(res, HttpStatusCode.InternalServerError, `User can not be found in ---USER:${__id} `)
            }

        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    calcAmountBeforePaiement: ({ amount }: { amount: number }) => {
        const comm: number = parseFloat(APP_FLEXPAYRETROCOMMISIONNE) || 0
        return (amount - (amount * (comm / 100)));
    },
    reCalcAmountBeforePaiement: ({ amount }: { amount: number }) => {
        const comm: number = parseFloat(APP_FLEXPAYRETROCOMMISIONNE) || 0
        return (amount + (amount * (comm / 100)));
    },
    converterDevise: async ({ amount, currency }: { currency: string, amount: number }) => {
        try {
            const configs = await Configs.findAll({
                order: [['id', 'DESC']],
                limit: 1
            });

            if (configs.length === 0) {
                return { code: 500, message: 'Erreur : Configurations non trouvées.', data: { currency, amount } };
            }

            const { taux_change, commission_price } = configs[0].toJSON() as any;
            const tauxDeChange = taux_change || 3000;

            if (typeof currency !== 'string') {
                return { code: 400, message: 'Erreur : La devise doit être une chaîne de caractères.', data: { currency, amount } };
            }

            currency = currency.toUpperCase();
            switch (currency) {
                case 'USD':
                    const convertedAmountToCDF = (amount / tauxDeChange).toFixed(3);
                    return {
                        code: 200,
                        message: `Montant converti de USD à CDF avec un taux de ${tauxDeChange}.`,
                        data: { currency, amount: parseFloat(convertedAmountToCDF) }
                    };

                case 'CDF':
                    return {
                        code: 200,
                        message: 'La devise est déjà en CDF, pas de conversion nécessaire.',
                        data: { currency, amount }
                    };

                default:
                    return {
                        code: 400,
                        message: 'Erreur : Devise non supportée.',
                        data: { currency, amount }
                    };
            }

        } catch (error: any) {
            // En cas d'erreur lors de l'exécution de la requête ou autre
            return {
                code: 500,
                message: `Erreur serveur : ${error.message}`,
                data: { currency, amount }
            };
        }
    },
    convertCurrency: async ({ amount, fromCurrency, toCurrency }: { amount: number, fromCurrency: string, toCurrency: string }) => {
        const apiKey = 'YOUR_API_KEY';
        const url = `http://data.fixer.io/api/latest?access_key=${apiKey}&base=${fromCurrency}&symbols=${toCurrency}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok || data.error) {
                throw new Error(data.error ? data.error.info : 'Erreur lors de la récupération des taux de change');
            }

            if (!data.rates.hasOwnProperty(toCurrency)) {
                throw new Error("La devise cible n'est pas prise en charge");
            }

            const rate = data.rates[toCurrency];
            const convertedAmount = amount * rate;

            return convertedAmount;
        } catch (error: any) {
            return error.message;
        }
    },
    loggerSystem: ({ message, title }: { message: any, title: string }) => {
        const fl = fs.createWriteStream('src/__assets/as_log/log.system.infos.ini', {
            flags: 'a' // 'a' means appending (old data will be preserved)
        })
        fl.write(`\n Title => ${title}\n Info => ${message}\n Temps => ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
        fl.write(`\n--------------------------------------------------------------------`);
        fl.close()
    },
    onSendSMS: async ({ to, content, is_flash }: { to: string, content: string, is_flash: boolean }): Promise<{ code: number, message: string, data: any }> => {
        return new Promise(async (resolve, reject) => {
            try {
                // || API_SMS_IS_FLASH,
                const payload = {
                    'phone': completeCodeCountryToPhoneNumber({ phone: to, withoutplus: false }),
                    'message': content,
                    'is_flash': (is_flash ? 1 : 0),
                    'app': APP_NAME
                };
                const { data, status, request, config, headers, statusText } = await axios({
                    method: "POST",
                    url: API_SMS_ENDPOINT,
                    data: payload,
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${API_SMS_TOKEN}`
                    }
                })
                log("Message was sent to ==> ", payload['phone'], "Content ==> ", payload['message'], "is_flash ==> ", is_flash)
                if (status === 200 || status === 201) return resolve({ code: status, message: "Message was succefuly sent ", data: data })
                else return resolve({ code: status, message: statusText, data })

            } catch (error: any) {
                log(error.toString())
                return reject({ code: 500, message: "Error on sending message", data: error.toString() })
            }
        })
    },
    onSendMailConfirmation: async ({
        cb,
        to,
        content: {
            fullname,
            confirmationink
        }
    }: { cb: Function, to: string, content: { fullname: string, confirmationink: string } }) => {
        cb = cb ? cb : () => { }
        fullname = capitalizeWords({ text: fullname })
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'mukulima.app@gmail.com',
                pass: 'zusa tcto irad zvqb'
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
                return cb(undefined, { code: 500, message: "error", data: error })
            } else {
                return cb(undefined, { code: 200, message: "Email sent", data: info })
            }
        });
    },
    onSendMail: async ({
        cb,
        to,
        content: {
            fullname,
            confirmationlink
        }
    }: { cb: Function, to: string, content: { fullname: string, confirmationlink: string } }) => {
        cb = cb ? cb : () => { }
        fullname = capitalizeWords({ text: fullname })
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'mukulima.app@gmail.com',
                pass: 'zusa tcto irad zvqb'
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

        transporter.sendMail(mailOptions, (error: any, info: any) => {
            if (error) {
                return cb(undefined, { code: 500, message: "error", data: error })
            } else {
                return cb(undefined, { code: 200, message: "Email sent", data: info })
            }
        });
    },
    addRoleToUser: async ({ inputs: { iduser, idroles }, transaction, cb }: { inputs: { iduser?: number, idroles: number[] }, transaction: any, cb: Function }) => {
        if (!iduser || !idroles) return cb(undefined, { code: 401, message: "This request must have at least !", data: { idroles, iduser } });
        try {
            if (Array.isArray(idroles)) {
                const done: any[] = []
                for (let role of idroles) {
                    const r = await Hasroles.create({
                        id: parseInt(randomLongNumber({ length: 6 })),
                        TblEcomRoleId: role,
                        TblEcomUserId: iduser
                    })
                        .then(r => done.push(r))
                        .catch(err => {
                            log(err, "This role can not be added to this ==> ", {
                                role,
                                iduser
                            })
                        })
                }
                return cb(undefined, { code: 200, message: "Done", data: done })
            }
        } catch (error: any) {
            return cb(undefined, { code: 500, message: "Error", data: error.toString() })
        }
    },
    removeRoleToUser: async ({ inputs: { iduser, idroles }, transaction, cb }: { inputs: { iduser?: number, idroles: number[] }, transaction: any, cb: Function }) => {
        if (!iduser || !idroles) return cb(undefined, { code: 401, message: "This request must have at least !", data: { idroles, iduser } });
        try {
            if (Array.isArray(idroles)) {
                const done: any[] = []
                for (let role of idroles) {
                    const r = await Hasroles.destroy({
                        where: {
                            TblEcomRoleId: role,
                            TblEcomUserId: iduser
                        }
                    })
                        .then(_ => {
                            done.push({
                                TblEcomRoleId: role,
                                TblEcomUserId: iduser
                            })
                        })
                        .catch(err => {
                            log(err, "On deleting role to user ==> ")
                            done.push({
                                TblEcomRoleId: role,
                                TblEcomUserId: iduser
                            })
                        })

                }
                return cb(undefined, { code: 200, message: "Done", data: done })
            }
        } catch (error: any) {
            return cb(undefined, { code: 500, message: "Error", data: error.toString() })
        }
    },
    onGenerateCardMember: async ({ id_user, id_cooperative }: { id_user: number, id_cooperative: number }): Promise<{ code: number, message: string, data: { card: string, expiresInString: string, expiresInUnix: number } }> => {
        return new Promise((resolve, reject) => {
            const expiresIn = addDaysThenReturnUnix({ days: 365 });
            const expiresInDate = unixToDate({ unix: expiresIn });
            let card = expiresIn.toString().concat(".").concat(id_user.toString()).concat(".").concat(id_cooperative.toString())
            let tr = card
            for (let index = 0; index < tries; index++) {
                tr = base64.encode(tr)
            }
            if (card) resolve({ code: 200, message: "Card created as expiresIn.id_user.id_cooperative", data: { card: tr, expiresInString: expiresInDate, expiresInUnix: expiresIn } })
            else reject({ code: 500, message: " --- can not encode card ", data: {} })
        })
    },
    addMembersToCoopec: async ({ inputs: { idmembers, idcooperative, expiresIn, expiresInUnix, card }, transaction, cb }: { inputs: { idmembers?: number[], idcooperative: number, card: string, expiresIn: string, expiresInUnix: string }, transaction: any, cb: Function }) => {
        if (!idmembers || !idcooperative) return cb(undefined, { code: 401, message: "This request must have at least !", data: { idmembers, idcooperative } });
        try {
            if (Array.isArray(idmembers)) {
                const done = []
                for (let member of idmembers) {
                    const r = await Hasmembers.create({
                        id: parseInt(randomLongNumber({ length: 6 })),
                        TblEcomCooperativeId: idcooperative,
                        TblEcomUserId: member,
                        carte: card,
                        date_expiration: expiresIn,
                        date_expiration_unix: expiresInUnix
                    }, { transaction })
                    done.push(r)
                }
                return cb(undefined, { code: 200, message: "Done", data: done })
            }
        } catch (error) {
            return cb(undefined, { code: 500, message: "Error", data: error })
        }
    },
    addMemberToCoopec: async ({ inputs, transaction, cb }: { inputs: { idmember?: number, idcooperative: number, card: string, expiresIn: string, expiresInUnix: string }, transaction: any, cb: Function }) => {
        const { idmember, idcooperative, card, expiresIn, expiresInUnix } = inputs;
        if (!idmember || !idcooperative) return cb(undefined, { code: 401, message: "This request must have at least !", data: { idmember, idcooperative } });
        try {
            if (idmember) {
                const member = await Hasmembers.create({
                    id: parseInt(randomLongNumber({ length: 6 })),
                    TblEcomCooperativeId: idcooperative,
                    TblEcomUserId: idmember,
                    carte: card,
                    date_expiration: expiresIn,
                    date_expiration_unix: expiresInUnix
                }, { transaction })
                if (member instanceof Hasmembers) {
                    return cb(undefined, { code: 200, message: "Done", data: member })
                } else return cb(undefined, { code: 500, message: "Error", data: null })
            }
        } catch (error) {
            return cb(undefined, { code: 500, message: "Error", data: error })
        }
    },
    rawRolesAsTableOfIds: async () => {
        const { count, rows } = await Roles.findAndCountAll({ where: {}, raw: true, attributes: ['id'] });
        if (count <= 0) return [];
        else {
            return rows.map(r => r && r['id'])
        }
    },
    rawCategoriesCoopecAsTableOfIds: async () => {
        const { count, rows } = await Categoriescooperatives.findAndCountAll({ where: {}, raw: true, attributes: ['id'] });
        if (count <= 0) return [];
        else {
            return rows.map(r => r && r['id'])
        }
    },
    estInclus({ arr1, arr2 }: { arr1: number[], arr2: number[] }) {
        const nonInclus = arr1.filter(element => !arr2.includes(element));
        if (nonInclus.length === 0) {
            return { code: 200, message: true, roles: arr1 };
        } else {
            return { code: 400, message: false, roles: nonInclus };
        }
    },
    rawProvincesAsTableOfIds: async () => {
        const { count, rows } = await Provinces.findAndCountAll({ where: {}, raw: true, attributes: ['id'] });
        if (count <= 0) return [];
        else {
            return rows.map(r => r && r['id'])
        }
    },
    rawTerritoiresAsTableOfIds: async ({ idprovince }: { idprovince: number }) => {
        const { count, rows } = await Territoires.findAndCountAll({ where: { idprovince }, raw: true, attributes: ['id'] });
        if (count <= 0) return [];
        else {
            return rows.map(r => r && r['id'])
        }
    },
    rawUsersAsTableOfIds: async () => {
        const { count, rows } = await Users.findAndCountAll({ where: {}, raw: true, attributes: ['id'] });
        if (count <= 0) return [];
        else {
            return rows.map(r => r && r['id'])
        }
    },
    rawVillagesAsTableOfIds: async ({ idterritoire }: { idterritoire: number }) => {
        const { count, rows } = await Villages.findAndCountAll({ where: {}, raw: true, attributes: ['id'] });
        if (count <= 0) return [];
        else {
            return rows.map(r => r && r['id'])
        }
    },
    uploadfile: async ({ inputs: { file, type, saveas } }: { inputs: { file: any, type: string, saveas: string } }): Promise<{ code: number, message: string, data: any }> => {
        return new Promise((resolve, reject) => {
            if (!file || !type) return reject({ code: 401, message: "This request must have at least file, and type of file !", data: { file, type } });
            try {
                tempfolder = saveas || tempfolder;
                const __file = file['files'][type];
                const filename = generateFilename({ prefix: type, tempname: __file['name'] });
                const uploadPath = 'src/__assets/' + tempfolder + '/' + filename;

                __file.mv(uploadPath, function (err: any) {
                    if (err) return reject({ code: 500, message: "An error was occured when trying to upload file", data: err })
                    else {
                        const slink: string = String(uploadPath).substring(String(uploadPath).indexOf("/") + 1)
                        return resolve({ code: 200, message: "File uploaded done", data: { filename, fullpath: slink } })
                    }
                });

            } catch (error) {
                return reject({ code: 500, message: "An error was occured !", data: error })
            }
        })
    }
}