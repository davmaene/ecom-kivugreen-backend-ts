import { completeCodeCountryToPhoneNumber, fillphone } from '__helpers/helper.fillphone';
import { Services } from './serives.all';
import axios from "axios";
import dotenv from 'dotenv';
import { randomLongNumber } from '__helpers/helper.random';

dotenv.config();

const { FLEXPAYMERCHANTID, FLEXPAYURL, CALLBACKURL, FLEXPAYTOKEN, FLEXPAYURLCHECK } = process.env;

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
                const { APP_FLEXPAYMERCHANTID, APP_FLEXPAYURL, APP_CALLBACKURL, APP_FLEXPAYTOKEN } = process.env;
                const _opphone = completeCodeCountryToPhoneNumber({ phone: fillphone({ phone }) });
                const _operationref = randomLongNumber({ length: 13 })

                const data = {
                    "merchant": APP_FLEXPAYMERCHANTID,
                    "type": "1",
                    "phone": _opphone,
                    "reference": _operationref,
                    "amount": amount,
                    "currency": currency.trim().toUpperCase(),
                    "callbackUrl": CALLBACKURL
                };

                axios({
                    method: 'POST',
                    url: FLEXPAYURL,
                    timeout,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${FLEXPAYTOKEN}`
                    },
                    data: { ...data }
                })
                    .then((response) => {
                        const { data, status } = response;

                        if (status === 200) {
                            const { code, message, orderNumber } = data;

                            loggerSystemOnPayement({
                                message: JSON.stringify({ ...data, phone: _opphone, amount, currency, orderNumber }),
                                title: "PAIEMENT AVEC FLEXPAY"
                            });

                            if (code === 0 || code === "0") {
                                Pendingpaiements.create({
                                    realref: operationref,
                                    reference: orderNumber,
                                    phone: _opphone,
                                    amount,
                                    currency,
                                    category
                                })
                                    .then(resp => {
                                        if (resp instanceof Pendingpaiements) {
                                            return cb(undefined, { code: 200, message: "A push message was sent the customer", data: { ...data } });
                                        } else {
                                            return cb(undefined, { code: 400, message: "An error occured when trying to resolve payement !", data: { ...err } });
                                        }
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        return cb(undefined, { code: 400, message: "An error occured when trying to resolve payement !", data: { ...err } });
                                    })
                            } else {
                                onSendSMS({
                                    to: `+${_opphone}`,
                                    content: `Désolé une erreur vient de se produire lors du paiement veuillez réessayer plus tard !`
                                }, (er, dn) => { })
                                return cb(undefined, { code: 400, message: "An error occured when trying to resolve payement !", data: {} });
                            }

                        } else {
                            loggerSystemOnPayement({
                                message: JSON.stringify({ ...data, phone: _opphone, amount, currency, orderNumber }),
                                title: "PAIEMENT AVEC FLEXPAY CRASHED"
                            });
                            return cb(undefined, { code: 400, message: "an error was occured when trying to process with payement !", data: {} })
                        }
                    })
                    .catch((error) => {
                        console.log("Error on paiement ===> ", error);
                        return cb(undefined, { code: 400, message: "An error occured when trying to resolve payement !", data: error })
                    });
            } catch (error) {
                Services.loggerSystem({ title: "Error on paiement ", message: JSON.stringify({ phone, amount, currency }) })
                console.log(" Une erreur vient de se produire on making paiement => ", error);

            }
        })
    }
}