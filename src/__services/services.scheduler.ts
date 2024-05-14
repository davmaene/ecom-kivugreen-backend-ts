import { Services } from './serives.all';
import schedule from 'node-schedule';
import moment from 'moment';
import { Paiements } from '../__models/model.payements';
import axios from 'axios';
import dotenv from 'dotenv';
import { now } from '../__helpers/helper.moment';
import { log } from 'console';
dotenv.config()

const { APP_FLEXPAYURLCHECK, APP_FLEXPAYTOKEN } = process.env;

export const Scheduler = {
    checkPayement: async ({ munites }: { munites: number }): Promise<{ code: number, message: string, data: any }> => {
        log("======================= Checkeng paiement in", munites, "munites")
        const rule: any = new schedule.RecurrenceRule();
        const cb: Function = () => { }

        rule.tz = 'Etc/GMT-2';
        var date = new Date(
            moment().year(),
            moment().month(),
            moment().date(),
            moment().hours(),
            moment().minutes() + (munites),
            0
        );

        return new Promise(async (resolve, reject) => {
            try {
                const j = schedule.scheduleJob(date, async () => {
                    const p = await Paiements.findAll({
                        where: {
                            status: 0, // means where paiement est encore en attente
                        },
                    });

                    const __treated: any[] = [];

                    for (let index = 0; index < p.length; index++) {
                        const { reference: idtransaction, amount, currency, realref, phone, description, category, createdby, createdAt, deletedAt, id, status: asstatus, updatedAt } = p[index].toJSON();
                        const _p = p[index];
                        const chk = await axios({
                            method: 'GET',
                            timeout: 0,
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${APP_FLEXPAYTOKEN}`,
                            },
                            url: APP_FLEXPAYURLCHECK + "/" + idtransaction,
                        })

                        let { status, data } = chk as any;
                        if (status === 200) {
                            const { code, message, transaction } = data;
                            const { status } = transaction;
                            console.log('====================================');
                            console.log("Message from Flexpay =======> ", data);
                            console.log('====================================');
                            // console.log("Message from transacrion is ==> ", message, transaction, "The value of the state is ===> ", status);
                            if (status === '0' || status === 0) {
                                //status === '0' || status === 0
                                const {
                                    currency,
                                    amountCustomer,
                                    reference,
                                    channel,
                                    createdAt,
                                    amount,
                                } = transaction;
                                try {
                                    Paiements.findOne({
                                        where: {
                                            reference: idtransaction,
                                            // ispending: 1
                                        },
                                    })
                                        .then((_s) => {
                                            if (_s instanceof Paiements) {
                                                _s.update({
                                                    status: 1 // ie. paiement effectuer avec succes
                                                })
                                                __treated.push(_p.toJSON())
                                                // return cb(undefined, {
                                                //     code: 200,
                                                //     message: 'We can not process with the request right now',
                                                //     data: data,
                                                // })
                                            } else {
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
                                } catch (error) {
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
                            } else {
                                _p.update({
                                    status: 2, // mis  ajour du status de payement
                                });
                                Services.onSendSMS({
                                    is_flash: false,
                                    to: phone,
                                    content: `votre paiement de ${amount}${currency} a echoué, ID transaction ${realref}, veillez réessayer un peu plus tard, en date du ${now({ options: {} })}`,
                                })
                                    .then(d => { })
                                    .catch(er => { })
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
                        } else {
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
                    })
                });
            } catch (error: any) {
                reject({
                    code: 500,
                    message: error.toString(),
                    data: error
                })
                return cb(undefined, ({
                    code: 500,
                    message: error.toString(),
                    data: error
                }))
            }
        })
    }
}