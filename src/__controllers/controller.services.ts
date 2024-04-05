import { Newsletters } from '../__models/model.newsletters';
import { HttpStatusCode } from '../__enums/enum.httpsstatuscode';
import { fillphone } from '../__helpers/helper.fillphone';
import { Responder } from '../__helpers/helper.responseserver';
import { Services } from '../__services/serives.all';
import { NextFunction, Response, Request } from 'express';

export const __controllerServices = {
    onsendsms: async (req: Request, res: Response, next: NextFunction) => {
        const { message, to } = req.body;
        try {
            Services.onSendSMS({
                to: fillphone({ phone: to }),
                content: message,
                is_flash: false
            })
                .then((sms: any) => {
                    const { code, message, data } = sms
                    return Responder(res, code, data)
                })
                .catch(er => {
                    return Responder(res, HttpStatusCode.InternalServerError, er)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    subscribetonewsletter: async (req: Request, res: Response, next: NextFunction) => {
        const { email, description } = req.body;
        if (!email) return Responder(res, HttpStatusCode.NotAcceptable, "this request must have at least email !")
        try {
            Newsletters.create({
                email,
                description
            })
                .then(news => {
                    if (news instanceof Newsletters) {
                        return Responder(res, HttpStatusCode.Ok, news)
                    } else {
                        return Responder(res, HttpStatusCode.InternalServerError, news)
                    }
                })
                .catch(err => {
                    return Responder(res, HttpStatusCode.InternalServerError, err.toString())
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}