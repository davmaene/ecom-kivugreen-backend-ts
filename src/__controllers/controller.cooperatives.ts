import { Cooperatives } from "../__models/model.cooperatives"
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode"
import { Responder } from "../__helpers/helper.responseserver"
import { NextFunction, Request, Response } from "express"
import { Services } from "../__services/serives.all"
import { log } from "console"
import { Users } from "../__models/model.users"
import { Hasmembers } from "../__models/model.hasmembers"
import { randomLongNumber } from "../__helpers/helper.random"

export const __controllerCooperatives = {
    
    list: async (req: Request, res: Response, next: NextFunction) => {
        try {
            Users.belongsToMany(Cooperatives, { through: Hasmembers });
            Cooperatives.belongsToMany(Users, { through: Hasmembers });
            Cooperatives.findAndCountAll({
                where: {},
                include: [
                    {
                        model: Users,
                        required: false,
                        attributes: ['id', 'nom', 'postnom', 'prenom', 'phone', 'email']
                        // isAliased: false,
                        // as: "resposable"
                    }
                ]
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
        let payload = { ...req.body }
        try {
            if (parseInt(isformel) === 1) {
                if (!req.files) return Responder(res, HttpStatusCode.NotAcceptable, "Please upload a attached file for this cooperative !")
                const { code, message, data } = await Services.uploadfile({
                    inputs: {
                        file: req,
                        saveas: 'as_docs',
                        type: 'file'
                    }
                })
                if (code === 200) {
                    const { filename, fullpath } = data
                    payload['file'] = fullpath
                } else {
                    return Responder(res, HttpStatusCode.NotAcceptable, "The file was not successfuly uploaded, Error on uploading the file !")
                }
            }

            payload['isformel'] = parseInt(payload['isformel'])
            payload['id_category'] = parseInt(payload['id_category'])
            payload['id_responsable'] = parseInt(payload['id_responsable'])
            payload['id_adjoint'] = parseInt(payload['id_adjoint'])
            payload['id_territoire'] = parseInt(payload['id_territoire'])

            Cooperatives.create({
                ...payload,
                num_enregistrement: randomLongNumber({ length: 12 })
            })
                .then(coopec => {
                    if (coopec instanceof Cooperatives) return Responder(res, HttpStatusCode.Ok, coopec)
                    else return Responder(res, HttpStatusCode.Conflict, coopec)
                })
                .catch(err => {
                    return Responder(res, HttpStatusCode.Conflict, err)
                })

        } catch (error) {
            log(error)
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    addmemebers: async (req: Request, res: Response, next: NextFunction) => {
        const { ids_members, id_cooperative } = req.body;
        if (!ids_members || !id_cooperative) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least ids_members and id_cooperative !")
        try {
            Services.addMembersToCoopec({
                inputs: {
                    idcooperative: parseInt(id_cooperative),
                    idmembers: [...ids_members],
                },
                transaction: null,
                cb: (err: any, done: any) => {
                    if (done) {
                        const { code, message, data } = done;
                        if (code === 200) {
                            return Responder(res, HttpStatusCode.Ok, data)
                        } else {
                            return Responder(res, HttpStatusCode.InternalServerError, "Error on initializing members table !")
                        }
                    } else {
                        return Responder(res, HttpStatusCode.InternalServerError, "Error on initializing members table !")
                    }
                }
            })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    delete: async (req: Request, res: Response) => {
        const { idcooperative } = req.params;
        try {
            Cooperatives.findByPk(idcooperative)
                .then(coopec => {
                    if (coopec instanceof Cooperatives) {
                        coopec.destroy({ force: true })
                            .then(D => Responder(res, HttpStatusCode.Ok, D))
                            .catch(Er => Responder(res, HttpStatusCode.InternalServerError, Er))
                    } else {
                        return Responder(res, HttpStatusCode.NotFound, coopec)
                    }
                })
                .catch(err => {
                    return Responder(res, HttpStatusCode.InternalServerError, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    update: async (res: Response, req: Request) => {
        const { idcooperative } = req.params
        if (idcooperative) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least idccoperative !")
        if (Object.keys(req.body).length <= 0) return Responder(res, HttpStatusCode.NotAcceptable, "The body should not be empty !")
        try {
            Cooperatives.update({
                ...req.body,
            }, {
                where: {
                    id: parseInt(idcooperative)
                }
            })
            .then(U => Responder(res, HttpStatusCode.Ok, U))
            .catch(Err => Responder(res, HttpStatusCode.InternalServerError, Err))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}