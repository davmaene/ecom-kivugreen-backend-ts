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
exports.Payements = void 0;
const helper_fillphone_1 = require("__helpers/helper.fillphone");
const serives_all_1 = require("./serives.all");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const helper_random_1 = require("__helpers/helper.random");
const model_payements_1 = require("__models/model.payements");
dotenv_1.default.config();
const { APP_FLEXPAYMERCHANTID, APP_FLEXPAYURL, APP_CALLBACKURL, APP_FLEXPAYTOKEN, APP_FLEXPAYURLCHECK } = process.env;
axios_1.default.interceptors.request.use(config => {
    // config.headers.apikey = "$2b$10$AS6GbX37SkQS6skhMOYjveDOuUUgvGz9dvsrCbeylWl/SwMkDDp2G";
    // config.headers.apikeyaccess = "kivugreen@api2022";
    return config;
}, rejected => {
    return Promise.reject(rejected);
});
axios_1.default.interceptors.response.use((resposne) => {
    return resposne;
}, error => {
    const er = error.response ? error.response : undefined;
    // console.log("Catch error Axios ==> Paiement Interface", error);
    return er ? er : Promise.reject(error);
});
const timeout = 120000;
exports.Payements = {
    pay: ({ phone, amount, currency }) => __awaiter(void 0, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                // const { APP_FLEXPAYMERCHANTID, APP_FLEXPAYURL, APP_CALLBACKURL, APP_FLEXPAYTOKEN } = process.env;
                const _opphone = (0, helper_fillphone_1.completeCodeCountryToPhoneNumber)({ phone: (0, helper_fillphone_1.fillphone)({ phone }) });
                const _operationref = (0, helper_random_1.randomLongNumber)({ length: 13 });
                const data = {
                    "merchant": APP_FLEXPAYMERCHANTID,
                    "type": "1",
                    "phone": _opphone,
                    "reference": _operationref,
                    "amount": amount,
                    "currency": currency.trim().toUpperCase(),
                    "callbackUrl": APP_CALLBACKURL
                };
                (0, axios_1.default)({
                    method: 'POST',
                    url: APP_FLEXPAYURL,
                    timeout,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${APP_FLEXPAYTOKEN}`
                    },
                    data: Object.assign({}, data)
                })
                    .then((response) => {
                    const { data, status } = response;
                    if (status === 200) {
                        const { code, message, orderNumber } = data;
                        serives_all_1.Services.loggerSystem({
                            message: JSON.stringify(Object.assign(Object.assign({}, data), { phone: _opphone, amount, currency, orderNumber })),
                            title: "PAIEMENT AVEC FLEXPAY"
                        });
                        if (code === 0 || code === "0") {
                            model_payements_1.Paiements.create({
                                realref: _operationref,
                                reference: orderNumber,
                                phone: _opphone,
                                amount,
                                currency,
                                category: 1,
                                description: `${status}`
                            })
                                .then(resp => {
                                if (resp instanceof model_payements_1.Paiements) {
                                    return resolve({ code: 200, message: "A push message was sent the customer", data: Object.assign({}, data) });
                                }
                                else {
                                    return reject({ code: 400, message: "An error occured when trying to resolve payement !", data: { error: resp } });
                                }
                            })
                                .catch(err => {
                                console.log(err);
                                return reject({ code: 400, message: "An error occured when trying to resolve payement !", data: Object.assign({}, err) });
                            });
                        }
                        else {
                            serives_all_1.Services.onSendSMS({
                                is_flash: false,
                                to: (0, helper_fillphone_1.fillphone)({ phone: _opphone }),
                                content: `Désolé une erreur vient de se produire lors du paiement veuillez réessayer plus tard !`
                            });
                            return reject({ code, message, data });
                        }
                    }
                    else {
                        serives_all_1.Services.loggerSystem({
                            message: JSON.stringify(Object.assign(Object.assign({}, data), { phone: _opphone, amount, currency })),
                            title: "PAIEMENT AVEC FLEXPAY CRASHED"
                        });
                        return reject({ code: 400, message: "an error was occured when trying to process with payement !", data: {} });
                    }
                })
                    .catch((error) => {
                    console.log("Error on paiement ===> ", error);
                    return reject({ code: 400, message: "An error occured when trying to resolve payement !", data: error });
                });
            }
            catch (error) {
                serives_all_1.Services.loggerSystem({ title: "Error on paiement ", message: JSON.stringify({ phone, amount, currency }) });
                console.log(" Une erreur vient de se produire on making paiement => ", error);
            }
        }));
    }),
    check: ({ phone, amount, currency }) => __awaiter(void 0, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
        });
    })
};