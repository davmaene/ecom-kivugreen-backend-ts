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
    }
}