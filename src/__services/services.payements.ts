import { completeCodeCountryToPhoneNumber, fillphone } from '__helpers/helper.fillphone';
import { Services } from './serives.all';
import axios from "axios";
import dotenv from 'dotenv';
import { randomLongNumber } from '__helpers/helper.random';
import { Paiements } from '__models/model.payements';

dotenv.config();

const { APP_FLEXPAYMERCHANTID, APP_FLEXPAYURL, APP_CALLBACKURL, APP_FLEXPAYTOKEN, APP_FLEXPAYURLCHECK } = process.env;

axios.interceptors.request.use(
    config => {
        // config.headers.apikey = "$2b$10$AS6GbX37SkQS6skhMOYjveDOuUUgvGz9dvsrCbeylWl/SwMkDDp2G";
        // config.headers.apikeyaccess = "kivugreen@api2022";
        return config;
    },
    rejected => {
        return Promise.reject(rejected)
    }
);

axios.interceptors.response.use(
    (resposne) => {
        return resposne;
    }
    , error => {
        const er = error.response ? error.response : undefined;
        // console.log("Catch error Axios ==> Paiement Interface", error);
        return er ? er : Promise.reject(error)
    }
);

const timeout = 120000;

export const Payements = {
    pay: async ({ phone, amount, currency }: { phone: string, amount: number, currency: string }): Promise<{ code: number, message: string, data: any }> => {
        return new Promise(async (resolve, reject) => {
            try {
                // const { APP_FLEXPAYMERCHANTID, APP_FLEXPAYURL, APP_CALLBACKURL, APP_FLEXPAYTOKEN } = process.env;
                const _opphone = completeCodeCountryToPhoneNumber({ phone: fillphone({ phone }) });
                const _operationref = randomLongNumber({ length: 13 })

                const data = {
                    "merchant": APP_FLEXPAYMERCHANTID,
                    "type": "1",
                    "phone": _opphone,
                    "reference": _operationref,
                    "amount": amount,
                    "currency": currency.trim().toUpperCase(),
                    "callbackUrl": APP_CALLBACKURL
                };

                axios({
                    method: 'POST',
                    url: APP_FLEXPAYURL,
                    timeout,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${APP_FLEXPAYTOKEN}`
                    },
                    data: { ...data }
                })
                    .then((response) => {
                        const { data, status } = response;

                        if (status === 200) {
                            const { code, message, orderNumber } = data;

                            Services.loggerSystem({
                                message: JSON.stringify({ ...data, phone: _opphone, amount, currency, orderNumber }),
                                title: "PAIEMENT AVEC FLEXPAY"
                            });

                            if (code === 0 || code === "0") {
                                Paiements.create({
                                    realref: _operationref,
                                    reference: orderNumber,
                                    phone: _opphone,
                                    amount,
                                    currency,
                                    category: 1,
                                    description: `${status}`
                                })
                                    .then(resp => {
                                        if (resp instanceof Paiements) {
                                            return resolve({ code: 200, message: "A push message was sent the customer", data: { ...data } });
                                        } else {
                                            return reject({ code: 400, message: "An error occured when trying to resolve payement !", data: { error: resp } });
                                        }
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        return reject({ code: 400, message: "An error occured when trying to resolve payement !", data: { ...err } });
                                    })
                            } else {
                                Services.onSendSMS({
                                    is_flash: false,
                                    to: fillphone({ phone: _opphone }),
                                    content: `Désolé une erreur vient de se produire lors du paiement veuillez réessayer plus tard !`
                                })
                                return reject({ code, message, data })
                            }

                        } else {
                            Services.loggerSystem({
                                message: JSON.stringify({ ...data, phone: _opphone, amount, currency }),
                                title: "PAIEMENT AVEC FLEXPAY CRASHED"
                            });
                            return reject({ code: 400, message: "an error was occured when trying to process with payement !", data: {} })
                        }
                    })
                    .catch((error) => {
                        console.log("Error on paiement ===> ", error);
                        return reject({ code: 400, message: "An error occured when trying to resolve payement !", data: error })
                    });
            } catch (error) {
                Services.loggerSystem({ title: "Error on paiement ", message: JSON.stringify({ phone, amount, currency }) })
                console.log(" Une erreur vient de se produire on making paiement => ", error);

            }
        })
    },
    check: async ({ phone, amount, currency }: { phone: string, amount: number, currency: string }): Promise<{ code: number, message: string, data: any }> => {
        return new Promise((resolve, reject) => {
            
        })
    }
}