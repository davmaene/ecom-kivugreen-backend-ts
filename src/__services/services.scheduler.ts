import { Services } from './serives.all';
import schedule from 'node-schedule';
import moment from 'moment';
import { Paiements } from '../__models/model.payements';
import axios from 'axios';
import dotenv from 'dotenv';
import { now } from '../__helpers/helper.moment';
dotenv.config()

const { APP_FLEXPAYURLCHECK, APP_FLEXPAYTOKEN } = process.env;

export const Scheduler = {
    checkPayement: async ({ munites }: { munites: number }, cb: Function) => {
        const rule = new schedule.RecurrenceRule();

        rule.tz = 'Etc/GMT-2';
        var date = new Date(
            moment().year(),
            moment().month(),
            moment().date(),
            moment().hours(),
            moment().minutes() + (munites),
            0
        );

        try {
            const j = schedule.scheduleJob(date, async () => {
                const p = await Paiements.findAll({
                    where: {
                        status: 1,
                    },
                });

                p.forEach(async (_p, _i) => {
                    const idtransaction = _p && _p['reference'];
                    const { amount, currency, realref } = _p;
                    axios({
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

                                                } else {
                                                    console.log(
                                                        ' Updating pending paiement failed ==>  ',
                                                        _s
                                                    );
                                                    return cb(undefined, {
                                                        code: 400,
                                                        message:
                                                            'We can not process with the request right now',
                                                        data: data,
                                                    });
                                                }
                                            })
                                            .catch((err) => {
                                                console.log(
                                                    ' Updating pending paiement failed ==>  ',
                                                    err
                                                );
                                                return cb(undefined, {
                                                    code: 400,
                                                    message:
                                                        'We can not process with the request right now',
                                                    data: data,
                                                });
                                            });
                                    } catch (error) {
                                        console.log(' Updating pending paiement failed ==>  ', error);
                                        return cb(undefined, {
                                            code: 400,
                                            message: 'We can not process with the request right now',
                                            data: data,
                                        });
                                    }
                                } else {
                                    _p.update({
                                        status: 2, // mis  ajour du status de payement
                                    });
                                    Services.onSendSMS({
                                        is_flash: false,
                                        to: _p && _p['phone'],
                                        content: `votre paiement de ${amount}${currency} a echoué, ID transaction ${realref}, veillez réessayer un peu plus tard, en date du ${now({ options: {} })}`,
                                    })
                                    .then(d => {

                                    })
                                    .catch(er => {
                                        
                                    })
                                    // console.log(' Paiement faild or not succeded ! ');
                                    return cb(undefined, {
                                        code: 400,
                                        message: 'Paiement still pending',
                                        data: data,
                                    });
                                }
                            } else {
                                // console.log(chk['data']);
                                return cb(undefined, {
                                    code: 400,
                                    message:
                                        'We can not process with the request right now, cause is still pending',
                                    data: data,
                                });
                            }
                        })
                        .catch((err: any) => {
                            // console.log(err);
                            return cb(undefined, {
                                code: 500,
                                message: 'An error was occured ',
                                data: {},
                            });
                        });
                });

            });
        } catch (error) {

        }
    }
}