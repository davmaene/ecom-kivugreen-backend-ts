import { Cooperatives } from "../__models/model.cooperatives"
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode"
import { Responder } from "../__helpers/helper.responseserver"
import { NextFunction, Request, Response } from "express"
import { Services } from "../__services/serives.all"
import { log } from "console"
import { Users } from "../__models/model.users"
import { Hasmembers } from "../__models/model.hasmembers"
import { randomLongNumber } from "../__helpers/helper.random"
import { Extras } from "../__models/model.extras"
import { fillphone } from "../__helpers/helper.fillphone"
import { now } from "../__helpers/helper.moment"
import { Provinces } from "../__models/model.provinces"
import { Territoires } from "../__models/model.territoires"
import { ServiceImage } from "../__services/services.images"
import { checkFileType } from "../__helpers/helper.all"

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
    getonebyid: async (req: Request, res: Response, next: NextFunction) => {
        const { idcooperative } = req.params
        try {

            Users.belongsToMany(Cooperatives, { through: Hasmembers });
            Cooperatives.belongsToMany(Users, { through: Hasmembers });
            Cooperatives.belongsTo(Provinces, { foreignKey: "id_province" });
            Cooperatives.belongsTo(Territoires, { foreignKey: "id_territoire" });

            Cooperatives.findOne({
                where: {
                    id: idcooperative
                },
                include: [
                    {
                        model: Provinces,
                        required: false,
                        // attributes: ['id', 'nom', 'postnom', 'prenom', 'phone', 'email']
                    },
                    {
                        model: Territoires,
                        required: false,
                        // attributes: ['id', 'nom', 'postnom', 'prenom', 'phone', 'email']
                    },
                    {
                        model: Users,
                        required: false,
                        attributes: ['id', 'nom', 'postnom', 'prenom', 'phone', 'email']
                    }
                ]
            })
                .then((row) => {
                    if (row instanceof Cooperatives) {
                        return Responder(res, HttpStatusCode.Ok, row)
                    } else {
                        return Responder(res, HttpStatusCode.NotFound, row)
                    }
                })
                .catch(err => {
                    return Responder(res, HttpStatusCode.Conflict, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    add: async (req: Request, res: Response, next: NextFunction) => {

        const { isformel } = req.body;
        if (!req.files) return Responder(res, HttpStatusCode.NotAcceptable, `This request must have at least req.files !`);
        const { logo, file } = req.files;

        let payload = { ...req.body }
        try {
            if (parseInt(isformel) === 1) {
                if (!req.files) return Responder(res, HttpStatusCode.NotAcceptable, "Please upload a attached file for this cooperative !")
                if (!file) return Responder(res, HttpStatusCode.NotAcceptable, "Please provide the file cause this is formel cooperative");
                const { mimetype } = req['files']['file'] as any
                const type: false | any = checkFileType({ as: 'doc', mimetype })
                if (!type) return Responder(res, HttpStatusCode.NotAcceptable, "Please provide the cooperative's logo as image file");
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

            if (!logo) return Responder(res, HttpStatusCode.NotAcceptable, "Please provide the cooperative's logo as image file");
            const { mimetype } = req['files']['logo'] as any
            const type: false | any = checkFileType({ as: 'img', mimetype })
            if (!type) return Responder(res, HttpStatusCode.NotAcceptable, "Please provide the cooperative's logo as image file");
            ServiceImage.onUploadImage({
                inputs: {
                    file: req,
                    saveas: 'as_image',
                    type: 'logo'
                },
                callBack: (err: any, done: any) => {
                    if (done) {
                        const { code, message, data } = done;
                        if (code === 200) {
                            const { fullpath, filename } = data
                            Cooperatives.create({
                                ...payload,
                                num_enregistrement: randomLongNumber({ length: 12 }),
                                logo: fullpath
                            })
                                .then(coopec => {
                                    if (coopec instanceof Cooperatives) return Responder(res, HttpStatusCode.Ok, coopec)
                                    else return Responder(res, HttpStatusCode.Conflict, coopec)
                                })
                                .catch(err => {
                                    return Responder(res, HttpStatusCode.Conflict, err)
                                })
                        } else {
                            return Responder(res, HttpStatusCode.Conflict, err)
                        }
                    } else {
                        return Responder(res, HttpStatusCode.InternalServerError, err)
                    }
                }
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
            const coopec = await Cooperatives.findOne({
                where: {
                    id: id_cooperative
                }
            })

            if (coopec instanceof Cooperatives) {
                const { adresse, cooperative, num_enregistrement } = coopec.toJSON() as any;
                const treated: any[] = []
                for (let index = 0; index < Array.from(ids_members).length; index++) {
                    const id_membre: number = ids_members[index]
                    Services.onGenerateCardMember({
                        id_cooperative: id_cooperative,
                        id_user: id_membre || index
                    })
                        .then(async ({ code, message, data }) => {
                            log("Generated card is =======> ", data)
                            if (code === 200) {
                                const { card, expiresInString, expiresInUnix } = data

                                Services.addMemberToCoopec({
                                    inputs: {
                                        idcooperative: parseInt(id_cooperative),
                                        idmember: id_membre || index,
                                        card,
                                        expiresIn: expiresInString,
                                        expiresInUnix: expiresInUnix.toString()
                                    },
                                    transaction: null,
                                    cb: async (err: any, done: any) => {
                                        if (done) {
                                            const { code, message, data } = done;
                                            if (code === 200) {
                                                const treated: any[] = []
                                                for (let index = 0; index < Array.from(data).length; index++) {
                                                    const { TblEcomCooperativeId: ascoopec, TblEcomUserId: asuser } = Array.from(data)[index] as any;
                                                    const member = await Users.findOne({ where: { id: parseInt(asuser) } })
                                                    if (member instanceof Users) {
                                                        const { phone, email, id, nom } = member.toJSON() as any
                                                        Services.onGenerateCardMember({
                                                            id_cooperative: ascoopec,
                                                            id_user: asuser
                                                        })
                                                            .then(async ({ code, message, data }) => {
                                                                log("Generated card is =======> ", data)
                                                                if (code === 200) {
                                                                    const { card, expiresInString, expiresInUnix } = data
                                                                    if (1) {
                                                                        Services.onSendSMS({
                                                                            to: fillphone({ phone }),
                                                                            is_flash: false,
                                                                            content: `Bonjour ${nom}, votre enregistrement dans la coopérative ${cooperative} en date du ${now({ options: {} })} a réussi, votre carte de membre sera expiré le ${expiresInString.toString()}`
                                                                        })
                                                                            .then(m => { })
                                                                            .catch(e => { })
                                                                        // treated.push(ext.toJSON())
                                                                    }
                                                                } else { }
                                                            })
                                                            .catch((err) => {
                                                                log("Error on generating card member of ==> ", ascoopec, asuser, err)
                                                            })
                                                    } else {
                                                        log("Error on generating card member of ==> user not initialized ", ascoopec, asuser, err)
                                                    }
                                                }
                                                return Responder(res, HttpStatusCode.Ok, treated)
                                            } else {
                                                log(data)
                                                return Responder(res, HttpStatusCode.InternalServerError, "Error on initializing members table !")
                                            }
                                        } else {
                                            log(done)
                                            return Responder(res, HttpStatusCode.InternalServerError, "Error on initializing members table ! ===")
                                        }
                                    }
                                })

                            } else {
                                return Responder(res, HttpStatusCode.BadRequest, `The request can not be proceded cause the card can not be initialized !`)
                            }
                        })
                        .catch(err => {
                            return Responder(res, HttpStatusCode.InternalServerError, err.toString())
                        })
                }
            } else {
                return Responder(res, HttpStatusCode.NotFound, `We can not process with this request cause ${id_cooperative}has not corres in Coopes table`)
            }

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
        if (Object.keys(req.body).length <= 0) return Responder(res, HttpStatusCode.NotAcceptable, "The body should not be empty !");
        const { id_territoire, id_province, coordonnees_gps, adresse, phone, email, num_enregistrement, isformel, sigle, cooperative, id_adjoint, id_responsable, description, id_category } = req.body as any
        try {
            Cooperatives.update({
                id_territoire,
                id_province,
                coordonnees_gps,
                adresse,
                phone,
                email,
                num_enregistrement,
                isformel,
                sigle,
                cooperative,
                id_adjoint,
                id_responsable,
                description,
                id_category
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