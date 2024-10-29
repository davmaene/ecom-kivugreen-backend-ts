import { log } from "console";
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { Users } from "../__models";
import { Cooperatives } from "../__models/model.cooperatives";
import { Credits } from "../__models/model.credits";
import { Request, Response } from "express";
import { capitalizeWords, returnStateCredit } from "../__helpers/helper.all";
import { date, now } from "../__helpers/helper.moment";
import { Services } from "../__services/serives.all";
import { fillphone } from "../__helpers/helper.fillphone";
import { Banks } from "../__models/model.banks";

export const __controllersCredits = {
    list: async (req: Request, res: Response) => {
        try {

            Credits.belongsTo(Users, { foreignKey: "id_user" })
            Credits.belongsTo(Cooperatives, { foreignKey: "id_cooperative" })
            Credits.belongsTo(Banks, { foreignKey: "validated_by_bank" })

            Credits.findAll({
                where: {},
                include: [
                    {
                        model: Cooperatives,
                        required: true
                    },
                    {
                        model: Banks,
                        required: false
                    },
                    {
                        model: Users,
                        required: false,
                        attributes: ['id', 'nom', 'postnom', 'phone', 'email', 'sexe']
                    }
                ]
            })
                .then((list) => {
                    return Responder(res, HttpStatusCode.Ok, { count: list.length, rows: list })
                })
                .catch(err => {
                    log(err)
                    return Responder(res, HttpStatusCode.InternalServerError, err)
                })
        } catch (error) {
            log(error)
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    listbystatus: async (req: Request, res: Response) => {
        const { status } = req.params
        if (!status) return Responder(res, HttpStatusCode.NoContent, "This request must have at least status")
        try {
            Credits.belongsTo(Users, { foreignKey: "id_user" })
            Credits.belongsTo(Cooperatives, { foreignKey: "id_cooperative" })
            Credits.belongsTo(Banks, { foreignKey: "validated_by_bank" })

            Credits.findAndCountAll({
                include: [
                    {
                        model: Cooperatives,
                        required: true
                    },
                    {
                        model: Banks,
                        required: false
                    },
                    {
                        model: Users,
                        required: false
                    }
                ]
            })
                .then(({ rows, count }) => {
                    return Responder(res, HttpStatusCode.Ok, { count, rows })
                })
                .catch(err => {
                    return Responder(res, HttpStatusCode.InternalServerError, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    add: async (req: Request, res: Response,) => {
        const { id_cooperative, id_member, montant, currency, motif, periode_remboursement } = req.body;
        if (!id_cooperative || !montant || !currency || !motif || !periode_remboursement) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least !id_cooperative  || !montant || !currency || !motif || !periode_remboursement")
        const _ = date()
        try {
            Credits.create({
                id_cooperative: parseInt(id_cooperative),
                montant: parseFloat(montant),
                currency: String(currency).toUpperCase(),
                motif: capitalizeWords({ text: motif }),
                id_user: id_member || null,
                periode_remboursement: parseInt(periode_remboursement),
                status: 0,
                createdat: _ as any
            })
                .then(async crd => {
                    if (crd instanceof Credits) {
                        if (id_member) {
                            const m = await Users.findOne({
                                where: {
                                    id: id_member
                                }
                            })
                            if (m instanceof Users) {
                                const { nom, postnom, prenom, phone, email } = m?.toJSON() as any
                                Services.onSendSMS({
                                    content: `Bonjour cher membre ${nom} ${postnom} nous avons reçu votre requête de démande de crédit pour un montant de ${montant}${currency}, une suite favorable vous sera envoyé après traitement de votre dossier`,
                                    is_flash: false,
                                    to: fillphone({ phone })
                                })
                                    .then(_ => { })
                                    .catch(_ => { })
                            }
                        }
                        return Responder(res, HttpStatusCode.Ok, crd)
                    } else return Responder(res, HttpStatusCode.Conflict, crd)
                })
                .catch(er => Responder(res, HttpStatusCode.InternalServerError, er))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    update: async (req: Request, res: Response,) => {
        const { idcredit } = req.params
        if (!idcredit) return Responder(res, HttpStatusCode.NoContent, "This request must have at least idcredit")
        if (Object.keys(req.body).length <= 0) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least somes keys in body !")
        const b = req.body as any;
        delete b.status
        try {
            Credits.update({
                ...b
            }, {
                where: {
                    id: idcredit
                }
            })
                .then(crd => {
                    if (crd) return Responder(res, HttpStatusCode.Ok, crd)
                    else return Responder(res, HttpStatusCode.Conflict, crd)
                })
                .catch(er => Responder(res, HttpStatusCode.InternalServerError, er))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    delete: async (req: Request, res: Response,) => {
        const { idcredit } = req.params
        if (!idcredit) return Responder(res, HttpStatusCode.NoContent, "This request must have at least idcredit")
        try {
            Credits.destroy({
                where: {
                    id: idcredit
                }
            })
                .then(crd => {
                    if (crd !== 0) return Responder(res, HttpStatusCode.Ok, `Item with id:::${idcredit} was successfuly deleted !`)
                    else return Responder(res, HttpStatusCode.NotFound, `Item with id:::${idcredit} not found !`)
                })
                .catch(er => Responder(res, HttpStatusCode.InternalServerError, er))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    validate: async (req: Request, res: Response,) => {
        const { id_credit } = req.params as any;
        const { state } = req.body as any
        if (!id_credit) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least id_credit !")
        const { currentuser } = req as any;
        const { __id, roles, uuid } = currentuser;
        try {
            const bank = await Banks.findOne({
                where: {
                    id_responsable: __id
                }
            })
            if (bank instanceof Banks) {
                const { id, id_responsable } = bank
                Credits.belongsTo(Users, { foreignKey: "id_user" })
                Credits.findOne({
                    include: [
                        {
                            model: Users,
                            attributes: ['id', 'phone', 'email', 'nom', 'postnom'],
                            required: false,
                        }
                    ],
                    where: {
                        id: id_credit
                    }
                })
                    .then(credit => {
                        if (credit instanceof Credits) {
                            const { status, __tbl_ecom_user, montant, currency, motif } = credit.toJSON() as any
                            // log(credit.toJSON())
                            if (status === 1) {
                                return Responder(res, HttpStatusCode.BadRequest, "The credit already validated !")
                            } else {
                                credit.update({
                                    status: state,
                                    validated_by_bank: id
                                })
                                    .then(__ => {
                                        const { phone, nom, postnom, email } = __tbl_ecom_user as any
                                        Services.onSendSMS({
                                            is_flash: false,
                                            to: phone,
                                            content: `Bonjour ${nom} ${postnom}, votre démande de crédit de ${montant}${currency} pour motif de ${motif} son état en maintenant ${returnStateCredit({ state })}; les autres informations vous seront transmises dans un bref délais`
                                        })
                                            .then(_ => { })
                                            .catch(err => { })
                                        return Responder(res, HttpStatusCode.Ok, credit)
                                    })
                                    .catch(err => {
                                        return Responder(res, HttpStatusCode.BadGateway, err)
                                    })
                            }
                        } else {
                            return Responder(res, HttpStatusCode.NotFound, credit)
                        }
                    })
                    .catch(err => {
                        return Responder(res, HttpStatusCode.InternalServerError, err)
                    })
            } else {
                return Responder(res, HttpStatusCode.NotFound, "Informations about bank not found !")
            }
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}