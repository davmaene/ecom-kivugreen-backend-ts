import { Users } from "../__models/model.users";
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { Hasmembers } from "../__models/model.hasmembers";
import { NextFunction, Request, Response } from "express";
import { log } from "console";
import { Cooperatives } from "../__models/model.cooperatives";
import { Extras } from "../__models/model.extras";
import { Op } from "sequelize";

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
                    // const __: any[] = []
                    // for (let index = 0; index < list.length; index++) {
                    //     const { TblEcomUserId } = list[index].toJSON() as any;
                    //     const element = list[index].toJSON() as any;
                    //     const extra = await Extras.findOne({
                    //         attributes: ['id','carte', 'date_expiration', 'date_expiration_unix', 'createdAt'],
                    //         where: {
                    //             id_user: TblEcomUserId
                    //         }
                    //     })
                    //     __.push({
                    //         ...extra?.toJSON(),
                    //         ...element,
                    //     })
                    // }
                    return Responder(res, HttpStatusCode.Ok, { count: list.length, rows: list })
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
                .then(async list => {
                    // const __: any[] = []
                    // for (let index = 0; index < list.length; index++) {
                    //     const { TblEcomUserId } = list[index].toJSON() as any;
                    //     const element = list[index].toJSON() as any;
                    //     const extra = await Extras.findOne({
                    //         attributes: ['id','carte', 'date_expiration', 'date_expiration_unix', 'createdAt'],
                    //         where: {
                    //             id_user: TblEcomUserId
                    //         }
                    //     })
                    //     __.push({
                    //         ...extra?.toJSON(),
                    //         ...element,
                    //     })
                    // }
                    return Responder(res, HttpStatusCode.Ok, { count: list.length, rows: list })
                })
                .catch(err => {
                    log(err)
                    return Responder(res, HttpStatusCode.InternalServerError, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    listbyothercooperative: async (req: Request, res: Response) => {
        const { idcooperative } = req.params;
        if (!idcooperative) return Responder(res, HttpStatusCode.NotAcceptable, "this request must have at least idcooperative ")
        try {
            Hasmembers.belongsTo(Users, { foreignKey: "TblEcomUserId" })
            Hasmembers.belongsTo(Cooperatives)
            Hasmembers.findAll({
                where: {
                    TblEcomCooperativeId: {
                        [Op.ne]: idcooperative
                    }
                },
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
                .then(async list => {
                    // const __: any[] = []
                    // for (let index = 0; index < list.length; index++) {
                    //     const { TblEcomUserId } = list[index].toJSON() as any;
                    //     const element = list[index].toJSON() as any;
                    //     const extra = await Extras.findOne({
                    //         attributes: ['id','carte', 'date_expiration', 'date_expiration_unix', 'createdAt'],
                    //         where: {
                    //             id_user: TblEcomUserId
                    //         }
                    //     })
                    //     __.push({
                    //         ...extra?.toJSON(),
                    //         ...element,
                    //     })
                    // }
                    return Responder(res, HttpStatusCode.Ok, { count: list.length, rows: list })
                })
                .catch(err => {
                    log(err)
                    return Responder(res, HttpStatusCode.InternalServerError, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
}