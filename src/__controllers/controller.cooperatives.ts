import { Cooperatives } from "../__models/model.cooperatives"
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode"
import { Responder } from "../__helpers/helper.responseserver"
import { NextFunction, Request, Response } from "express"
import { Services } from "../__services/serives.all"

export const __controllerCooperatives = {
    list: async (req: Request, res: Response, next: NextFunction) => {
        try {
            Cooperatives.findAndCountAll({
                where: {}
            })
                .then(({ rows, count }) => {
                    return Responder(res, HttpStatusCode.Ok, { count, rows })
                })
                .catch(err => {
                    return Responder(res, HttpStatusCode.Conflict, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    add: async (req: Request, res: Response, next: NextFunction) => {
        const { isformel } = req.body
        try {
            if (isformel === 1) {
                if (!req.files) return Responder(res, HttpStatusCode.NotAcceptable, "Please upload a attached file for this cooperative !")
                Services.uploadfile({
                    inputs: {
                        file: req.files,
                        saveas: 'as_images',
                        type: 'file'
                    }
                })
            }
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}