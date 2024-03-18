import { HttpStatusCode } from '../__enums/enum.httpsstatuscode'
import { Responder } from '../__helpers/helper.responseserver'
import { Provinces } from '../__models/model.provinces'
import { Territoires } from '../__models/model.territoires'
import { Response, NextFunction, Request } from 'express'

export const __controllerTerritoires = {
    list: async (req: Request, res: Response, next: NextFunction) => {
        try {
            Territoires.belongsTo(Provinces, { foreignKey: 'idprovince' })
            Territoires.findAndCountAll({
                where: {},
                include: [
                    {
                        model: Provinces,
                        required: true
                    }
                ]
            })
                .then(({ count, rows }) => Responder(res, HttpStatusCode.Ok, { count, rows }))
                .catch(err => Responder(res, HttpStatusCode.Conflict, err))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    listbyprovince: async (req: Request, res: Response, next: NextFunction) => {
        const { idprovince } = req.params
        try {
            Territoires.findAndCountAll({
                where: {
                    idprovince: parseInt(idprovince)
                }
            })
                .then(({ count, rows }) => Responder(res, HttpStatusCode.Ok, { count, rows }))
                .catch(err => Responder(res, HttpStatusCode.Conflict, err))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}