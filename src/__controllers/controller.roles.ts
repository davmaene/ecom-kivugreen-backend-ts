import { HttpStatusCode } from '../__enums/enum.httpsstatuscode';
import { Responder } from '../__helpers/helper.responseserver';
import { Request, Response, NextFunction } from 'express';
import { Roles } from '../__models/model.roles';
import { capitalizeWords } from '../__helpers/helper.all';
import { log } from 'console';
import { Services } from '../__services/serives.all';

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
    addtouser: async (req: Request, res: Response, next: NextFunction) => {
        const { id_roles, id_user } = req.body;
        if (!id_roles || !id_user) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least !id_roles || !id_user")
        if (!Array.isArray(id_roles)) return Responder(res, HttpStatusCode.NotAcceptable, "id_roles must be a type of array !")
        if (Array.from(id_roles).length === 0) return Responder(res, HttpStatusCode.NotAcceptable, "id_roles must be a type of array ! and should not be empty ")

        try {
            const rls = (await Services.rawRolesAsTableOfIds()) as number[];
            const isIn = (Services.estInclus({ arr1: id_roles, arr2: rls }));
            const { code, message, roles } = isIn
            if (code === 400) {
                return Responder(res, HttpStatusCode.NotAcceptable, `Sorry this values are not acceptable ( ${roles.join(",")} )`)
            }
            Services.addRoleToUser({
                inputs: {
                    idroles: [...id_roles],
                    iduser: id_user
                },
                transaction: null,
                cb: (err: any, ro: any) => {
                    if (ro) {
                        const { code, message, data } = ro
                        if (code === 200) {
                            return Responder(res, HttpStatusCode.Ok, ro)
                        } else return Responder(res, HttpStatusCode.BadRequest, data)
                    } else return Responder(res, HttpStatusCode.BadRequest, err)
                }
            })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    removeroletouser: async (req: Request, res: Response, next: NextFunction) => {
        const { id_roles, id_user } = req.body;
        if (!id_roles || !id_user) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least !id_roles || !id_user")
        if (!Array.isArray(id_roles)) return Responder(res, HttpStatusCode.NotAcceptable, "id_roles must be a type of array !")
        if (Array.from(id_roles).length === 0) return Responder(res, HttpStatusCode.NotAcceptable, "id_roles must be a type of array ! and should not be empty ")

        try {
            const rls = (await Services.rawRolesAsTableOfIds()) as number[];
            const isIn = (Services.estInclus({ arr1: id_roles, arr2: rls }));
            const { code, message, roles } = isIn
            if (code === 400) {
                return Responder(res, HttpStatusCode.NotAcceptable, `Sorry this values are not acceptable ( ${roles.join(",")} )`)
            }

            Services.removeRoleToUser({
                inputs: {
                    idroles: [...id_roles],
                    iduser: id_user
                },
                transaction: null,
                cb: (err: any, ro: any) => {
                    if (ro) {
                        const { code, message, data } = ro
                        if (code === 200) {
                            return Responder(res, HttpStatusCode.Ok, ro)
                        } else {
                            return Responder(res, HttpStatusCode.BadRequest, data)
                        }
                    } else {
                        log(err)
                        return Responder(res, HttpStatusCode.BadRequest, err)
                    }
                }
            })
        } catch (e: any) {
            log(e)
            return Responder(res, HttpStatusCode.InternalServerError, e)
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
    },
    update: async (req: Request, res: Response) => {
        const { id } = req.params as any
        const { role, description } = req.body;
        if (!id) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least id")
        if (Object.keys(req.body).length <= 0) return Responder(res, HttpStatusCode.NotAcceptable, "the body should not be empty!")
        try {
            Roles.findOne({
                where: {
                    id
                }
            })
                .then(cat => {
                    if (cat instanceof Roles) {
                        cat.update({
                            role,
                            description
                        })
                            .then(_ => Responder(res, HttpStatusCode.Ok, cat))
                            .catch(__ => Responder(res, HttpStatusCode.NotFound, "Item not found"))
                    } else {
                        return Responder(res, HttpStatusCode.NotFound, "Item not found")
                    }
                })
                .catch(Err => Responder(res, HttpStatusCode.NotAcceptable, Err))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    delete: async (req: Request, res: Response,) => {
        const { id } = req.params as any
        if (!id) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least id")
        try {
            Roles.findOne({
                where: {
                    id
                }
            })
                .then(cat => {
                    if (cat instanceof Roles) {
                        cat.destroy()
                            .then(_ => Responder(res, HttpStatusCode.Ok, `Item with id:::${id} was successfuly deleted `))
                    } else {
                        return Responder(res, HttpStatusCode.NotFound, "Item not found")
                    }
                })
                .catch(Err => Responder(res, HttpStatusCode.NotAcceptable, Err))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}