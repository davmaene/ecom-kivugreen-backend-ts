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
dotenv_1.default.config();
const { APP_FLEXPAYURLCHECK, APP_FLEXPAYTOKEN } = process.env;
exports.Scheduler = {
    checkPayement: ({ munites }, cb) => __awaiter(void 0, void 0, void 0, function* () {
        const rule = new node_schedule_1.default.RecurrenceRule();
        rule.tz = 'Etc/GMT-2';
        var date = new Date((0, moment_1.default)().year(), (0, moment_1.default)().month(), (0, moment_1.default)().date(), (0, moment_1.default)().hours(), (0, moment_1.default)().minutes() + (munites), 0);
        try {
            const j = node_schedule_1.default.scheduleJob(date, () => __awaiter(void 0, void 0, void 0, function* () {
                const p = yield model_payements_1.Paiements.findAll({
                    where: {
                        status: 1,
                    },
                });
                p.forEach((_p, _i) => __awaiter(void 0, void 0, void 0, function* () {
                    const idtransaction = _p && _p['reference'];
                    const { amount, currency, realref } = _p;
                    (0, axios_1.default)({
                        method: 'GET',
                        timeout: 0,
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${APP_FLEXPAYTOKEN}`,
                        },
                        url: APP_FLEXPAYURLCHECK + "/" + idtransaction,
                    })
                        .then((chk) => {
                        let { status, data } = chk;
                        if (status === 200) {
                            const { code, message, transaction } = data;
                            const { status } = transaction;
                            console.log('====================================');
                            console.log("Message from Flexpay =======> ");
                            console.log('====================================');
                            // console.log("Message from transacrion is ==> ", message, transaction, "The value of the state is ===> ", status);
                            if (status === '0' || status === 0) {
                                //status === '0' || status === 0
                                const { currency, amountCustomer, reference, channel, createdAt, amount, } = transaction;
                                try {
                                    model_payements_1.Paiements.findOne({
                                        where: {
                                            reference: idtransaction,
                                            // ispending: 1
                                        },
                                    })
                                        .then((_s) => {
                                        if (_s instanceof model_payements_1.Paiements) {
                                        }
                                        else {
                                            console.log(' Updating pending paiement failed ==>  ', _s);
                                            return cb(undefined, {
                                                code: 400,
                                                message: 'We can not process with the request right now',
                                                data: data,
                                            });
                                        }
                                    })
                                        .catch((err) => {
                                        console.log(' Updating pending paiement failed ==>  ', err);
                                        return cb(undefined, {
                                            code: 400,
                                            message: 'We can not process with the request right now',
                                            data: data,
                                        });
                                    });
                                }
                                catch (error) {
                                    console.log(' Updating pending paiement failed ==>  ', error);
                                    return cb(undefined, {
                                        code: 400,
                                        message: 'We can not process with the request right now',
                                        data: data,
                                    });
                                }
                            }
                            else {
                                _p.update({
                                    status: 2, // mis  ajour du status de payement
                                });
                                serives_all_1.Services.onSendSMS({
                                    is_flash: false,
                                    to: _p && _p['phone'],
                                    content: `votre paiement de ${amount}${currency} a echoué, ID transaction ${realref}, veillez réessayer un peu plus tard, en date du ${(0, helper_moment_1.now)({ options: {} })}`,
                                })
                                    .then(d => {
                                })
                                    .catch(er => {
                                });
                                // console.log(' Paiement faild or not succeded ! ');
                                return cb(undefined, {
                                    code: 400,
                                    message: 'Paiement still pending',
                                    data: data,
                                });
                            }
                        }
                        else {
                            // console.log(chk['data']);
                            return cb(undefined, {
                                code: 400,
                                message: 'We can not process with the request right now, cause is still pending',
                                data: data,
                            });
                        }
                    })
                        .catch((err) => {
                        // console.log(err);
                        return cb(undefined, {
                            code: 500,
                            message: 'An error was occured ',
                            data: {},
                        });
                    });
                }));
            }));
        }
        catch (error) {
        }
    })
};
