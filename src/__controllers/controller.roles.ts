import { HttpStatusCode } from '../__enums/enum.httpsstatuscode';
import { Responder } from '../__helpers/helper.responseserver';
import { Request, Response, NextFunction } from 'express';
import { Roles } from '../__models/model.roles';
import { capitalizeWords } from '../__helpers/helper.all';

export const __controllerRoles = {
    list: async (req: Request, res: Response, next: NextFunction) => {
        try {
            Roles.findAndCountAll({
                where: {}
            })
                .then(({ rows, count }) => {
                    return Responder(res, HttpStatusCode.Ok, { rows, count })
                })
                .catch(err => {
                    return Responder(res, HttpStatusCode.InternalServerError, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    add: async (req: Request, res: Response, next: NextFunction) => {
        const { role, description } = req.body;
        try {
            Roles.create({
                role: capitalizeWords({ text: role }),
                description
            })
                .then(ro => {
                    if (ro instanceof Roles) return Responder(res, HttpStatusCode.Ok, ro)
                    else return Responder(res, HttpStatusCode.Conflict, ro)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}