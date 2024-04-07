import { HttpStatusCode } from "__enums/enum.httpsstatuscode";
import { Responder } from "__helpers/helper.responseserver";
import { Payements } from "__services/services.payements";
import { log } from "console";
import { NextFunction, Request, Response } from "express";

export const __controllerPayements = {
    list: async (req: Request, res: Response, next: NextFunction) => {

    },
    listbyowner: async (req: Request, res: Response, next: NextFunction) => {

    },
    makepayement: async (req: Request, res: Response, next: NextFunction) => {
        const { phone, amount, currency } = req.body;
        if (!phone || !amount || !currency)
            return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least !phone || !amount || !currency")
        try {
            Payements.pay({
                amount,
                currency,
                phone
            })
                .then(pay => {

                })
                .catch((err: any) => {
                    log("Error on payement ==> ", err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}