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
exports.Scheduler = void 0;
const serives_all_1 = require("./serives.all");
const node_schedule_1 = __importDefault(require("node-schedule"));
const moment_1 = __importDefault(require("moment"));
const model_payements_1 = require("../__models/model.payements");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const helper_moment_1 = require("../__helpers/helper.moment");
const model_commandes_1 = require("../__models/model.commandes");
const helper_fillphone_1 = require("../__helpers/helper.fillphone");
dotenv_1.default.config();
const { APP_FLEXPAYURLCHECK, APP_FLEXPAYTOKEN } = process.env;
exports.Scheduler = {
    checkPayement: ({ munites, secondes }) => __awaiter(void 0, void 0, void 0, function* () {
        const rule = new node_schedule_1.default.RecurrenceRule();
        const cb = () => { };
        rule.tz = 'Etc/GMT-2';
        var date = new Date((0, moment_1.default)().year(), (0, moment_1.default)().month(), (0, moment_1.default)().date(), (0, moment_1.default)().hours(), (0, moment_1.default)().minutes() + (munites), (0, moment_1.default)().seconds() + (secondes), 0);
        return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const j = node_schedule_1.default.scheduleJob(date, () => __awaiter(void 0, void 0, void 0, function* () {
                    const p = yield model_payements_1.Paiements.findAll({
                        where: {
                            status: 0, // means where paiement est encore en attente
                        },
                    });
                    const __treated = [];
                    for (let index = 0; index < p.length; index++) {
                        const { reference: idtransaction, amount, currency, realref, phone, customer_phone, description, category, createdby, createdAt, deletedAt, id, status: asstatus, updatedAt } = p[index].toJSON();
                        const _p = p[index];
                        const chk = yield (0, axios_1.default)({
                            method: 'GET',
                            timeout: 0,
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${APP_FLEXPAYTOKEN}`,
                            },
                            url: APP_FLEXPAYURLCHECK + "/" + idtransaction,
                        });
                        let { status, data } = chk;
                        if (status === 200) {
                            const { code, message, transaction } = data;
                            const { status } = transaction;
                            console.log('====================================');
                            console.log("Message from Flexpay =======> ", data);
                            console.log('====================================');
                            // console.log("Message from transacrion is ==> ", message, transaction, "The value of the state is ===> ", status);
                            if (status === '0' || status === 0) {
                                //status === '0' || status === 0
                                const { currency, amountCustomer: amount, reference, channel, createdAt,
                                // amount,
                                 } = transaction;
                                try {
                                    model_payements_1.Paiements.findOne({
                                        where: {
                                            reference: idtransaction,
                                            // ispending: 1
                                        },
                                    })
                                        .then((_s) => {
                                        if (_s instanceof model_payements_1.Paiements) {
                                            _s.update({
                                                status: 1 // ie. paiement effectuer avec succes
                                            });
                                            __treated.push(_p.toJSON());
                                            model_commandes_1.Commandes.update({
                                                state: 3
                                            }, {
                                                where: {
                                                    transaction: idtransaction
                                                }
                                            })
                                                .then(__ => {
                                                // p.update({ status: 2 })
                                                serives_all_1.Services.onSendSMS({
                                                    is_flash: false,
                                                    to: (0, helper_fillphone_1.fillphone)({ phone: customer_phone || phone }),
                                                    content: `Félicitations votre paiement de ${amount}${currency} a été reçu avec succès !ID:${idtransaction}`
                                                })
                                                    .then(_ => { })
                                                    .catch(_ => { });
                                                // return resolve({ code: 200, message: "Transaction done resolved !", data: data })
                                            })
                                                .catch(err => {
                                                serives_all_1.Services.onSendSMS({
                                                    is_flash: false,
                                                    to: (0, helper_fillphone_1.fillphone)({ phone: customer_phone || phone }),
                                                    content: `Désolé votre paiement de ${amount}${currency} est en cours de traietement !ID:${idtransaction}`
                                                })
                                                    .then(_ => { })
                                                    .catch(_ => { });
                                                // return reject({ code: 500, message: "An error occured when trying to resolve payement !", data: data })
                                            });
                                            // return cb(undefined, {
                                            //     code: 200,
                                            //     message: 'We can not process with the request right now',
                                            //     data: data,
                                            // })
                                        }
                                        else {
                                            console.log(' Updating pending paiement failed ==>  ', _s);
                                            // reject({
                                            //     code: 400,
                                            //     message: 'We can not process with the request right now',
                                            //     data: data,
                                            // })
                                            // return cb(undefined, {
                                            //     code: 400,
                                            //     message: 'We can not process with the request right now',
                                            //     data: data,
                                            // });
                                        }
                                    })
                                        .catch((err) => {
                                        console.log(' Updating pending paiement failed ==>  ', err);
                                        // reject({
                                        //     code: 400,
                                        //     message: 'We can not process with the request right now',
                                        //     data: data,
                                        // })
                                        // return cb(undefined, {
                                        //     code: 400,
                                        //     message: 'We can not process with the request right now',
                                        //     data: data,
                                        // });
                                    });
                                }
                                catch (error) {
                                    console.log(' Updating pending paiement failed ==>  ', error);
                                    // reject({
                                    //     code: 400,
                                    //     message: 'We can not process with the request right now',
                                    //     data: data,
                                    // })
                                    // return cb(undefined, {
                                    //     code: 400,
                                    //     message: 'We can not process with the request right now',
                                    //     data: data,
                                    // });
                                }
                            }
                            else {
                                _p.update({
                                    status: 2, // mis  ajour du status de payement
                                });
                                serives_all_1.Services.onSendSMS({
                                    is_flash: false,
                                    to: phone,
                                    content: `votre paiement de ${amount}${currency} a echoué, ID transaction ${realref}, veillez réessayer un peu plus tard, en date du ${(0, helper_moment_1.now)({ options: {} })}`,
                                })
                                    .then(d => { })
                                    .catch(er => { });
                                console.log(' Paiement succeded ! ', _p.toJSON());
                                // reject({
                                //     code: 400,
                                //     message: 'Paiement still pending',
                                //     data: data,
                                // })
                                // return cb(undefined, {
                                //     code: 400,
                                //     message: 'Paiement still pending',
                                //     data: data,
                                // });
                            }
                        }
                        else {
                            console.log(chk['data']);
                            // reject({
                            //     code: 400,
                            //     message: 'We can not process with the request right now, cause is still pending',
                            //     data: data,
                            // })
                            // return cb(undefined, {
                            //     code: 400,
                            //     message: 'We can not process with the request right now, cause is still pending',
                            //     data: data,
                            // });
                        }
                    }
                    resolve({
                        code: 200,
                        message: "Succeded paiement",
                        data: __treated
                    });
                }));
            }
            catch (error) {
                reject({
                    code: 500,
                    message: error.toString(),
                    data: error
                });
                return cb(undefined, ({
                    code: 500,
                    message: error.toString(),
                    data: error
                }));
            }
        }));
    })
};
