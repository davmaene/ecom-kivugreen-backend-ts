import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { Request, Response } from "express";

export const __controllerConfigs = {
    add: async (req: Request, res: Response) => {
        const { taux_change, commission_price } = req.body;
        if(!taux_change || !commission_price) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least !taux_change || !commission_price")
        try {
            
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}