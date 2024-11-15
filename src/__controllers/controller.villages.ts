import { Territoires } from "../__models/model.territoires";
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { Villages } from "../__models/model.villages";
import { NextFunction, Request, Response } from "express";
import { Provinces } from "../__models/model.provinces";

export const __controllerVillages = {
    getvillagebyid: async (req: Request, res: Response, next: NextFunction) => {
        const { id_village } = req.params as any
        if (!id_village || isNaN(id_village)) return Responder(res, HttpStatusCode.NotAcceptable, "Please provide village id")
        Villages.belongsTo(Territoires, { foreignKey: "idterritoire" })
        Territoires.belongsTo(Provinces, { foreignKey: "idprovince" })
        Villages.findOne({
            include: [
                {
                    model: Territoires,
                    required: false,
                    include: [
                        {
                            model: Provinces,
                            required: true
                        }
                    ]
                }
            ],
            where: {
                id: id_village
            }
        })
            .then((village) => {
                if (village instanceof Villages) return Responder(res, HttpStatusCode.Ok, village)
                else return Responder(res, HttpStatusCode.NotFound, village)
            })
            .catch(err => Responder(res, HttpStatusCode.InternalServerError, err))
    },
    list: async (req: Request, res: Response, next: NextFunction) => {
        Villages.findAndCountAll({
            where: {

            }
        })
            .then(({ count, rows }) => {
                return Responder(res, HttpStatusCode.Ok, { count, rows })
            })
            .catch(err => Responder(res, HttpStatusCode.InternalServerError, err))
    },
    listbyterritoire: async (req: Request, res: Response, next: NextFunction) => {
        const { idterritoire } = req.params
        if (!idterritoire) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least ! idterritoire")
        Villages.findAndCountAll({
            where: {
                idterritoire
            }
        })
            .then(({ count, rows }) => {
                return Responder(res, HttpStatusCode.Ok, { count, rows })
            })
            .catch(err => Responder(res, HttpStatusCode.InternalServerError, err))
    },
}