import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { Response, Request } from "express";

export const __controllerStocks = {
    in: async (req: Request, res: Response) => {
        const { id_ccoperative, items } = req.body;
        const { currentuser } = req as any;
        if (!id_ccoperative || !items) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least !id_ccoperative || !items")
        const { __id, roles, uuid, phone } = currentuser

        try {

        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    list: (req: Request, res: Response) => {

    }
}