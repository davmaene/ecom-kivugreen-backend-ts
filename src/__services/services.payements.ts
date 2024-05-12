import { completeCodeCountryToPhoneNumber, fillphone } from '../__helpers/helper.fillphone';
import { Services } from './serives.all';
import axios from "axios";
import dotenv from 'dotenv';
import { randomLongNumber } from '../__helpers/helper.random';
import { Paiements } from '../__models/model.payements';
import { log } from 'console';
import { Commandes } from '../__models/model.commandes';

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
    pay: async ({ phone, amount, currency, createdby, reference, customer_phone }: { phone: string, customer_phone: string, amount: number, currency: string, createdby: number, reference: string }): Promise<{ code: number, message: string, data: any }> => {
        return new Promise(async (resolve, reject) => {
            try {
                const _opphone = completeCodeCountryToPhoneNumber({ phone: fillphone({ phone }), withoutplus: true });
                const _copphone = fillphone({ phone: customer_phone });
                const _operationref = reference || randomLongNumber({ length: 13 });
                const _amount = Services.calcAmountBeforePaiement({ amount });

                const payload = {
                    "merchant": APP_FLEXPAYMERCHANTID,
                    "type": "1",
                    "phone": _opphone,
                    "reference": _operationref,
                    "amount": _amount,
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
                    data: { ...payload }
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
                                    customer_phone: _copphone,
                                    phone: _opphone,
                                    amount,
                                    currency,
                                    category: 1,
                                    description: message,
                                    createdby
                                })
                                    .then(resp => {
                                        if (resp instanceof Paiements) {
                                            Services.loggerSystem({
                                                message: JSON.stringify({ ...data, phone: _opphone, amount, currency }),
                                                title: "PAIEMENT AVEC FLEXPAY LOUNCHED"
                                            });
                                            return resolve({ code: 200, message: "A push message was sent the customer", data: { ...data } });
                                        } else {
                                            Services.loggerSystem({
                                                message: JSON.stringify({ ...data, phone: _opphone, amount, currency }),
                                                title: "PAIEMENT AVEC FLEXPAY CRASHED"
                                            });
                                            return reject({ code: 400, message: "An error occured when trying to resolve payement !", data: { error: resp } });
                                        }
                                    })
                                    .catch(err => {
                                        Services.loggerSystem({
                                            message: JSON.stringify({ ...data, phone: _opphone, amount, currency }),
                                            title: "PAIEMENT AVEC FLEXPAY CRASHED"
                                        });
                                        return reject({ code: 400, message: "An error occured when trying to resolve payement !", data: { ...err } });
                                    })
                            } else {
                                Services.onSendSMS({
                                    is_flash: false,
                                    to: fillphone({ phone: _opphone }),
                                    content: `Désolé une erreur vient de se produire lors du paiement veuillez réessayer plus tard !`
                                })
                                    .then(_ => { })
                                    .catch(_ => { })
                                // log(response.data, payload)
                                Services.loggerSystem({
                                    message: JSON.stringify({ ...data, phone: _opphone, amount, currency }),
                                    title: "PAIEMENT AVEC FLEXPAY CRASHED"
                                });
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
                        Services.loggerSystem({
                            message: JSON.stringify({ ...payload, phone: _opphone, amount, currency }),
                            title: "PAIEMENT AVEC FLEXPAY CRASHED"
                        });
                        console.log("Error on paiement ===> ", error);
                        return reject({ code: 500, message: "An error occured when trying to resolve payement !", data: error.toString() })
                    });
            } catch (error: any) {
                Services.loggerSystem({ title: "Error on paiement ", message: JSON.stringify({ phone, amount, currency }) })
                console.log(" Une erreur vient de se produire on making paiement => ", error);
                return reject({ code: 500, message: "An error occured when trying to resolve payement !", data: error.toString() })
            }
        })
    },
    check: async ({ idtransaction }: { idtransaction: string }): Promise<{ code: number, message: string, data: any }> => {
        return new Promise(async (resolve, reject) => {
            const p = await Paiements.findOne({
                where: {
                    realref: idtransaction, // means where paiement est encore en attente
                },
            });
            if (p instanceof Paiements) {
                const { status: aspstatus, phone, amount, category, createdby, currency, description, customer_phone, createdAt, deletedAt, id, realref, reference, updatedAt } = p.toJSON();
                const chk = await axios({
                    method: 'GET',
                    timeout: 0,
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${APP_FLEXPAYTOKEN}`,
                    },
                    url: APP_FLEXPAYURLCHECK + "/" + idtransaction,
                })

                const { status, config, data, headers, statusText } = chk
                if (status === 200) {
                    const { code, message, transaction } = data;
                    const { status: asstatus } = transaction as any;
                    console.log('====================================');
                    console.log("Message from Flexpay =======> ", data);
                    console.log('====================================');
                    // console.log("Message from transacrion is ==> ", message, transaction, "The value of the state is ===> ", status);
                    if (asstatus === '0' || asstatus === 0) {
                        if (aspstatus === 0) {
                            Commandes.update({
                                state: 3
                            }, {
                                where: {
                                    transaction: idtransaction
                                }
                            })
                                .then(__ => {
                                    p.update({ status: 2 })
                                    Services.onSendSMS({
                                        is_flash: false,
                                        to: fillphone({ phone: customer_phone }),
                                        content: `Désolé votre paiement de ${amount}${currency} est en cours de traietement !ID:${idtransaction}`
                                    })
                                        .then(_ => { })
                                        .catch(_ => { })
                                    return reject({ code: 200, message: "Transaction done resolved !", data: data })
                                })
                                .catch(err => {
                                    Services.onSendSMS({
                                        is_flash: false,
                                        to: fillphone({ phone: customer_phone }),
                                        content: `Désolé votre paiement de ${amount}${currency} est en cours de traietement !ID:${idtransaction}`
                                    })
                                        .then(_ => { })
                                        .catch(_ => { })
                                    return reject({ code: 500, message: "An error occured when trying to resolve payement !", data: data })
                                })
                        } else {
                            Services.onSendSMS({
                                is_flash: false,
                                to: fillphone({ phone: customer_phone }),
                                content: `Désolé votre paiement de ${amount}${currency} est en cours de traietement !`
                            })
                                .then(_ => { })
                                .catch(_ => { })
                            return reject({ code: 500, message: "An error occured when trying to resolve payement !", data: data })
                        }
                    } else {
                        return reject({ code: 500, message: "An error occured when trying to resolve payement !", data: data })
                    }
                } else {
                    return reject({ code: 500, message: "An error occured when trying to resolve payement !", data: data })
                }
            } else {
                reject({
                    code: 404,
                    message: "Not found" + idtransaction,
                    data: idtransaction
                })
            }
        })
    }
}