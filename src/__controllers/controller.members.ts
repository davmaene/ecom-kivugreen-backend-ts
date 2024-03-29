import { HttpStatusCode } from "__enums/enum.httpsstatuscode";
import { Responder } from "__helpers/helper.responseserver";
import { NextFunction, Request, Response } from "express";

export const __controllerMembers = {
    list: async (req: Request, res: Response, next: NextFunction) => {

    },
    listbycooperative: async (req: Request, res: Response) => {
        const { idcooperative } = req.params;
        if(idcooperative) return Responder(res, HttpStatusCode.NotAcceptable, "this request must have at least idcooperative ")
        try {

        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}