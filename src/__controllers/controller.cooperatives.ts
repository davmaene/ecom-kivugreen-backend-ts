import { Cooperatives } from "../__models/model.cooperatives"
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode"
import { Responder } from "../__helpers/helper.responseserver"
import { NextFunction, Request, Response } from "express"
import { Services } from "../__services/serives.all"
import { log } from "console"
import { Users } from "../__models/model.users"

export const __controllerCooperatives = {
    list: async (req: Request, res: Response, next: NextFunction) => {
        try {
            Cooperatives.belongsTo(Users, {foreignKey: "id_responsable"})
            Cooperatives.findAndCountAll({
                where: {},
                include: [
                    {
                        model: Users,
                        required: true,
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
                }else{
                    return Responder(res, HttpStatusCode.NotAcceptable, "The file was not successfuly uploaded, Error on uploading the file !")
                }
            }

            payload['isformel'] = parseInt(payload['isformel'])
            payload['id_category'] = parseInt(payload['id_category'])
            payload['id_responsable'] = parseInt(payload['id_responsable'])
            payload['id_adjoint'] = parseInt(payload['id_adjoint'])
            payload['id_territoire'] = parseInt(payload['id_territoire'])

            Cooperatives.create({
                ...payload
            })
            .then(coopec => {
                if(coopec instanceof Cooperatives) return Responder(res, HttpStatusCode.Ok, coopec)
                else return Responder(res, HttpStatusCode.Conflict, coopec)
            })
            .catch(err => {
                return Responder(res, HttpStatusCode.Conflict, err)
            })

        } catch (error) {
            log(error)
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}