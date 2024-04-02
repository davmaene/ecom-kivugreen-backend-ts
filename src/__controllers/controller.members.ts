import { Users } from "../__models/model.users";
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { Hasmembers } from "../__models/model.hasmembers";
import { NextFunction, Request, Response } from "express";
import { log } from "console";
import { Cooperatives } from "../__models/model.cooperatives";
import { Extras } from "../__models/model.extras";

export const __controllerMembers = {
    list: async (req: Request, res: Response, next: NextFunction) => {
        try {
            Hasmembers.belongsTo(Users, { foreignKey: "TblEcomUserId" })
            Hasmembers.belongsTo(Cooperatives)
            Hasmembers.findAll({
                where: {},
                include: [
                    {
                        model: Users,
                        required: true,
                        attributes: ['id', 'nom', 'postnom', 'prenom', 'prenom', 'phone', 'email']
                    },
                    {
                        model: Cooperatives,
                        required: true
                    }
                ]
            })
                .then(async list => {
                    const treated: any[] = []

                    for (let index = 0; index < (list as any).length; index++) {
                        const { TblEcomUserId } = list[index] as any;
                        const item = (list[index]).toJSON()
                        const extras = await Extras.findOne({
                            where: {
                                id_user: TblEcomUserId
                            }
                        })
                        treated.push({
                            __tbl_ecom_extra: extras ? extras.toJSON() : null,
                            ...item,
                        })
                    }
                    return Responder(res, HttpStatusCode.Ok, { count: treated.length, rows: treated })
                })
                .catch(err => {
                    log(err)
                    return Responder(res, HttpStatusCode.InternalServerError, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    listbycooperative: async (req: Request, res: Response) => {
        const { idcooperative } = req.params;
        if (!idcooperative) return Responder(res, HttpStatusCode.NotAcceptable, "this request must have at least idcooperative ")
        try {
            Hasmembers.belongsTo(Users, { foreignKey: "TblEcomUserId" })
            Hasmembers.belongsTo(Cooperatives)
            Hasmembers.findAll({
                where: {
                    TblEcomCooperativeId: parseInt(idcooperative)
                },
                logging: true,
                include: [
                    {
                        model: Users,
                        required: true,
                        attributes: ['id', 'nom', 'postnom', 'prenom', 'prenom', 'phone', 'email']
                    },
                    {
                        model: Cooperatives,
                        required: true,
                    }
                ]
            })
                .then(list => {
                    return Responder(res, HttpStatusCode.Ok, { count: list.length, rows: list })
                })
                .catch(err => {
                    log(err)
                    return Responder(res, HttpStatusCode.InternalServerError, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}