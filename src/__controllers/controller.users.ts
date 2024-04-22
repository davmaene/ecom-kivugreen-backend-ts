import { connect } from '../__databases/connecte';
import { fillphone } from '../__helpers/helper.fillphone';
import { Users } from '../__models/model.users';
import { Hasroles } from '../__models/model.hasroles';
import { Provinces } from '../__models/model.provinces';
import { Roles } from '../__models/model.roles';
import { Request, Response, NextFunction, } from 'express'
import { Territoires } from '../__models/model.territoires';
import { Villages } from '../__models/model.villages';
import { Op } from 'sequelize';
import { comparePWD, hashPWD } from '../__helpers/helper.passwords';
import { randomLongNumber } from '../__helpers/helper.random';
import { Responder } from '../__helpers/helper.responseserver';
import { HttpStatusCode } from '../__enums/enum.httpsstatuscode';
import { Middleware } from '../__middlewares/middleware.cookies';
import { capitalizeWords, formatUserModel } from '../__helpers/helper.all';
import dotenv from 'dotenv';
import { log } from 'console';
import { v4 as uuidv4 } from 'uuid';
import { Services } from '../__services/serives.all';
import { Extras } from '../__models/model.extras';
import { Hasmembers } from '../__models/model.hasmembers';
import { Cooperatives } from '../__models/model.cooperatives';

dotenv.config()

const { APP_EXIPRES_IN_ADMIN, APP_EXIPRES_IN_ALL, APP_ESCAPESTRING, APP_NAME } = process.env

export const __controllerUsers = {
    otp: async (req: Request, res: Response, next: NextFunction) => {
        const { phone, password } = req.body;
        const role = [1, 3, 2, 4, 5]// allowed roles to connect 
        if (!phone) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least !phone")

        try {

            const transaction = await connect.transaction();

            Users.belongsToMany(Roles, { through: Hasroles });
            Roles.belongsToMany(Users, { through: Hasroles });

            Provinces.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Provinces, { foreignKey: "idprovince" });

            Territoires.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Territoires, { foreignKey: "idterritoire" });

            Villages.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Villages, { foreignKey: "idvillage" });

            Users.findOne({
                where: {
                    [Op.or]: [
                        { email: phone },
                        { phone: fillphone({ phone }) }
                    ]
                },
                include: [
                    {
                        model: Roles,
                        required: true,
                        attributes: ['id', 'role']
                    },
                    {
                        model: Provinces,
                        required: false,
                        attributes: ['id', 'province']
                    },
                    {
                        model: Territoires,
                        required: false,
                        attributes: ['id', 'territoire']
                    },
                    {
                        model: Villages,
                        required: false,
                        attributes: ['id', 'village']
                    }
                ]
            })
                .then(async user => {
                    if (user instanceof Users) {
                        const { password: aspassword, isvalidated, __tbl_ecom_roles, id } = user.toJSON() as any;
                        const extras = await Extras.findOne({
                            where: {
                                id_user: id
                            }
                        })
                        const roles = Array.from(__tbl_ecom_roles).map((role: any) => role['id']);
                        if ((Array.from(roles).some(r => role.includes(r))) && (extras instanceof Extras)) {
                            log(user)
                        } else {
                            transaction.rollback()
                            return Responder(res, HttpStatusCode.Unauthorized, "You dont have right access please contact admin system !")
                        }
                    } else {
                        transaction.rollback()
                        return Responder(res, HttpStatusCode.Forbidden, "Phone | Email or Password incorrect !")
                    }
                })
                .catch(err => {
                    log(err)
                    return Responder(res, HttpStatusCode.Conflict, err)
                })
        } catch (error) {
            log(error)
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    signin: async (req: Request, res: Response, next: NextFunction) => {
        const { phone, password } = req.body;
        const role = [1, 3, 2, 4, 5]// allowed roles to connect 
        if (!phone || !password) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least !phone || !password")

        try {

            const transaction = await connect.transaction();

            Users.belongsToMany(Roles, { through: Hasroles });
            Roles.belongsToMany(Users, { through: Hasroles });

            Provinces.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Provinces, { foreignKey: "idprovince" });

            Territoires.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Territoires, { foreignKey: "idterritoire" });

            Villages.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Villages, { foreignKey: "idvillage" });

            Users.findOne({
                where: {
                    [Op.or]: [
                        { email: phone },
                        { phone: fillphone({ phone }) }
                    ]
                },
                include: [
                    {
                        model: Roles,
                        required: true,
                        attributes: ['id', 'role']
                    },
                    {
                        model: Provinces,
                        required: false,
                        attributes: ['id', 'province']
                    },
                    {
                        model: Territoires,
                        required: false,
                        attributes: ['id', 'territoire']
                    },
                    {
                        model: Villages,
                        required: false,
                        attributes: ['id', 'village']
                    }
                ]
            })
                .then(user => {
                    if (user instanceof Users) {
                        const { password: aspassword, isvalidated, __tbl_ecom_roles } = user.toJSON() as any;
                        const roles = Array.from(__tbl_ecom_roles).map((role: any) => role['id']);
                        comparePWD({
                            hashedtext: aspassword || '',
                            plaintext: password
                        })
                            .then(verified => {
                                if (verified) {
                                    if (isvalidated === 1) {
                                        if (Array.from(roles).some(r => role.includes(r))) {
                                            Middleware.onSignin({
                                                expiresIn: APP_EXIPRES_IN_ADMIN || '45m',
                                                data: {
                                                    phone: user && user['phone'],
                                                    uuid: user && user['uuid'],
                                                    __id: user && user['id'],
                                                    roles
                                                }
                                            },
                                                (reject: string, token: string) => {
                                                    if (token) {
                                                        // user = formatUserModel({ model: user })
                                                        if (user !== null) {
                                                            if (user.hasOwnProperty('isvalidated')) {
                                                                delete user['isvalidated']
                                                            }
                                                            if (user.hasOwnProperty('password')) {
                                                                delete user['password']
                                                            }
                                                        }
                                                        transaction.commit()
                                                        return Responder(res, HttpStatusCode.Ok, { token, user })
                                                    } else {
                                                        transaction.rollback()
                                                        return Responder(res, HttpStatusCode.Forbidden, "Your refresh token already expired ! you must login to get a new one !")
                                                    }
                                                })
                                        } else {
                                            transaction.rollback()
                                            return Responder(res, HttpStatusCode.Unauthorized, "You dont have right access please contact admin system !")
                                        }
                                    } else {
                                        transaction.rollback()
                                        return Responder(res, HttpStatusCode.NotAcceptable, "Account not validated !")
                                    }
                                } else {
                                    transaction.rollback()
                                    return Responder(res, HttpStatusCode.Forbidden, "Phone | Email or Password incorrect !")
                                }
                            })
                            .catch(err => {
                                transaction.rollback()
                                return Responder(res, HttpStatusCode.Forbidden, "Phone | Email or Password incorrect !")
                            })
                    } else {
                        transaction.rollback()
                        return Responder(res, HttpStatusCode.Forbidden, "Phone | Email or Password incorrect !")
                    }
                })
                .catch(err => Responder(res, HttpStatusCode.Conflict, err))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    resetpassword: async (req: Request, res: Response, next: NextFunction) => {
        const { phone } = req.body
        if (!phone) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least ! phone in body ")
        try {
            const user = await Users.findOne({
                where: {
                    [Op.or]: [
                        { email: phone },
                        { phone: fillphone({ phone }) }
                    ]
                }
            })
            if (user instanceof Users) {
                const { id, email, phone: asphone, nom } = user.toJSON() as any
                const code_ = randomLongNumber({ length: 6 })
                const extras = await Extras.findOne({
                    where: {
                        id_user: id
                    }
                })
                if (extras instanceof Extras) {
                    extras.update({
                        verification: code_
                    })
                        .then(V => {
                            Services.onSendSMS({
                                is_flash: false,
                                to: fillphone({ phone }),
                                content: `${code_} \nBonjour ${capitalizeWords({ text: nom })} Ceci est votre code de vérification, pour votre démande de réinitialisation de mot de passe`,
                            })
                                .then(suc => {
                                    return Responder(res, HttpStatusCode.Ok, `A verification code was sent to ${phone} use it to recover the password !`)
                                })
                                .catch(err => {
                                    return Responder(res, HttpStatusCode.InternalServerError, extras)
                                })
                        })
                        .catch(Err => {
                            return Responder(res, HttpStatusCode.InternalServerError, Err)
                        })
                } else {
                    Extras.create({
                        id_user: id,
                        verification: code_
                    })
                        .then(extras => {
                            Services.onSendSMS({
                                is_flash: false,
                                to: fillphone({ phone }),
                                content: `${code_} \nBonjour ${capitalizeWords({ text: nom })} Ceci est votre code de vérification, pour votre démande de réinitialisation de mot de passe`,
                            })
                                .then(suc => {
                                    return Responder(res, HttpStatusCode.Ok, `A verification code was sent to ${phone} use it to recover the password !`)
                                })
                                .catch(err => {
                                    return Responder(res, HttpStatusCode.InternalServerError, extras)
                                })
                        })
                        .catch(Errr => {
                            return Responder(res, HttpStatusCode.InternalServerError, Errr)
                        })
                }
            } else {
                return Responder(res, HttpStatusCode.NotFound, `User not found on this server ${phone}:::Users`)
            }
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    recoverypassword: async (req: Request, res: Response, next: NextFunction) => {
        const { phone, verification_code, password } = req.body
        if (!phone || !verification_code || !password) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least ! phone in body ")
        try {
            Users.belongsToMany(Roles, { through: Hasroles });
            Roles.belongsToMany(Users, { through: Hasroles });

            Provinces.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Provinces, { foreignKey: "idprovince" });

            Territoires.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Territoires, { foreignKey: "idterritoire" });

            Villages.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Villages, { foreignKey: "idvillage" });

            const user = await Users.findOne({
                attributes: {
                    exclude: ['password']
                },
                include: [
                    {
                        model: Roles,
                        required: true,
                        attributes: ['id', 'role']
                    },
                    {
                        model: Provinces,
                        required: false,
                        attributes: ['id', 'province']
                    },
                    {
                        model: Territoires,
                        required: false,
                        attributes: ['id', 'territoire']
                    },
                    {
                        model: Villages,
                        required: false,
                        attributes: ['id', 'village']
                    }
                ],
                where: {
                    [Op.or]: [
                        { email: phone },
                        { phone: fillphone({ phone }) }
                    ]
                }
            })
            const pwd = await hashPWD({ plaintext: password })
            if (user instanceof Users) {
                const { id, email, phone: asphone, nom } = user.toJSON()
                const extras = await Extras.findOne({
                    where: {
                        id_user: id
                    }
                })
                if (extras instanceof Extras) {
                    const { verification } = extras
                    if (String(verification) === String(verification_code)) {
                        user.update({
                            password: pwd
                        })
                            .then(U => {
                                Services.onSendSMS({
                                    is_flash: false,
                                    to: fillphone({ phone }),
                                    content: `Bonjour ${nom}, votre mot de passe a été mise à jour avec succès !`,
                                })
                                    .then(suc => {
                                        return Responder(res, HttpStatusCode.Ok, user.toJSON())
                                    })
                                    .catch(err => {
                                        return Responder(res, HttpStatusCode.InternalServerError, extras)
                                    })
                            })
                    } else {
                        return Responder(res, HttpStatusCode.BadRequest, `Invalid code was used ${verification_code}:::Code`)
                    }
                } else {
                    return Responder(res, HttpStatusCode.BadRequest, `User not found on this server ${phone}:::Users`)
                }
            } else {
                return Responder(res, HttpStatusCode.NotFound, `User not found on this server ${phone}:::Users`)
            }
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    signup: async (req: Request, res: Response, next: NextFunction) => {
        const { nom, postnom, prenom, email, phone, adresse, idprovince, idterritoire, idvillage, date_naiss, genre, password, avatar } = req.body;
        if (!nom || !postnom || !phone || !password)
            return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least ==> nom & postnom & phone & password")
        const code_ = randomLongNumber({ length: 6 })
        const idroles: number[] = [5]

        try {
            const pwd = await hashPWD({ plaintext: password })
            const transaction = await connect.transaction();
            const uuid = uuidv4();

            Users.create({
                uuid,
                nom: capitalizeWords({ text: nom }),
                postnom: capitalizeWords({ text: postnom }),
                prenom: prenom ? capitalizeWords({ text: prenom }) : APP_ESCAPESTRING,
                email: email || fillphone({ phone }),
                phone: fillphone({ phone }),
                idprovince,
                idterritoire,
                idvillage,
                date_naiss,
                sexe: genre,
                password: pwd
            }, { transaction })
                .then(user => {
                    if (user instanceof Users) {

                        user = user.toJSON();
                        delete user['password'];
                        delete user['idprovince'];
                        delete user['idterritoire'];
                        delete user['idvillage'];
                        delete user['isvalidated'];
                        const { id, } = user

                        Services.addRoleToUser({
                            inputs: {
                                idroles,
                                iduser: id
                            },
                            transaction,
                            cb: (err: any, done: any) => {
                                if (done) {
                                    const { code } = done;
                                    const { id } = user
                                    if (code === 200) {

                                        Extras.create({
                                            id_user: id,
                                            verification: code_,
                                        }, { transaction })
                                            .then(extras => {
                                                if (extras instanceof Extras) {
                                                    if (email) {
                                                        let chaine = JSON.stringify({
                                                            email: email,
                                                            phone: user['phone'],
                                                        })
                                                    }

                                                    Services.onSendSMS({
                                                        is_flash: false,
                                                        to: fillphone({ phone }),
                                                        content: `Bonjour ${capitalizeWords({ text: nom })} votre compte a été crée avec succès. Ceci est votre code de vérirification ${code_}`,
                                                    })
                                                        .then(suc => {
                                                            transaction.commit()
                                                            return Responder(res, HttpStatusCode.Created, user)
                                                        })
                                                        .catch(err => {
                                                            transaction.rollback()
                                                            return Responder(res, HttpStatusCode.InternalServerError, extras)
                                                        })
                                                } else {
                                                    transaction.rollback()
                                                    return Responder(res, HttpStatusCode.InternalServerError, extras)
                                                }
                                            })
                                            .catch(er => {
                                                transaction.rollback()
                                                return Responder(res, HttpStatusCode.InternalServerError, er)
                                            })
                                    } else {
                                        transaction.rollback()
                                        return Responder(res, HttpStatusCode.InternalServerError, "Role not initialized correctly !")
                                    }
                                } else {
                                    transaction.rollback()
                                    return Responder(res, HttpStatusCode.InternalServerError, "Role not initialized correctly !")
                                }
                            }
                        })
                    } else return Responder(res, HttpStatusCode.BadRequest, user)
                })
                .catch(err => {
                    transaction.rollback()
                    const { name, errors } = err;
                    const { message } = errors[0];
                    return Responder(res, HttpStatusCode.Conflict, { name, error: message })
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    auth: async (req: Request, res: Response, next: NextFunction) => {
        const { phone, password } = req.body;
        const role = [1, 3, 2]// allowed roles to connect 
        if (!phone || !password) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least !phone || !password")

        try {

            const transaction = await connect.transaction();

            Users.belongsToMany(Roles, { through: Hasroles });
            Roles.belongsToMany(Users, { through: Hasroles });

            Provinces.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Provinces, { foreignKey: "idprovince" });

            Territoires.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Territoires, { foreignKey: "idterritoire" });

            Villages.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Villages, { foreignKey: "idvillage" });

            Users.findOne({
                where: {
                    [Op.or]: [
                        { email: phone },
                        { phone: fillphone({ phone }) }
                    ]
                },
                include: [
                    {
                        model: Roles,
                        required: true,
                        attributes: ['id', 'role']
                    },
                    {
                        model: Provinces,
                        required: false,
                        attributes: ['id', 'province']
                    },
                    {
                        model: Territoires,
                        required: false,
                        attributes: ['id', 'territoire']
                    },
                    {
                        model: Villages,
                        required: false,
                        attributes: ['id', 'village']
                    }
                ]
            })
                .then(user => {
                    if (user instanceof Users) {
                        const { password: aspassword, isvalidated, __tbl_ecom_roles } = user.toJSON() as any;
                        const roles = Array.from(__tbl_ecom_roles).map((role: any) => role['id']);
                        comparePWD({
                            hashedtext: aspassword || '',
                            plaintext: password
                        })
                            .then(verified => {
                                if (verified) {
                                    if (isvalidated === 1) {
                                        if (Array.from(roles).some(r => role.includes(r))) {
                                            Middleware.onSignin({
                                                expiresIn: APP_EXIPRES_IN_ADMIN || '45m',
                                                data: {
                                                    phone: user && user['phone'],
                                                    uuid: user && user['uuid'],
                                                    __id: user && user['id'],
                                                    roles
                                                }
                                            },
                                                async (reject: string, token: string) => {
                                                    if (token) {
                                                        const { id } = (user as any).toJSON() as any || {}
                                                        const coopec = await Cooperatives.findOne({
                                                            where: {
                                                                id_responsable: id
                                                            }
                                                        })
                                                        // user = formatUserModel({ model: user })
                                                        if (user !== null) {
                                                            if (user.hasOwnProperty('isvalidated')) {
                                                                delete user['isvalidated']
                                                            }
                                                            if (user.hasOwnProperty('password')) {
                                                                delete user['password']
                                                            }
                                                        }
                                                        if (coopec instanceof Cooperatives && user instanceof Users) {
                                                            const { id } = coopec.toJSON()
                                                            user = user.toJSON() as any
                                                            if (user !== null) {
                                                                (user as any)['id_cooperative'] = id as number
                                                            }
                                                        }
                                                        transaction.commit()
                                                        return Responder(res, HttpStatusCode.Ok, { token, user })
                                                    } else {
                                                        transaction.rollback()
                                                        return Responder(res, HttpStatusCode.Forbidden, "Your refresh token already expired ! you must login to get a new one !")
                                                    }
                                                })
                                        } else {
                                            transaction.rollback()
                                            return Responder(res, HttpStatusCode.Unauthorized, "You dont have right access please contact admin system !")
                                        }
                                    } else {
                                        transaction.rollback()
                                        return Responder(res, HttpStatusCode.NotAcceptable, "Account not validated !")
                                    }
                                } else {
                                    transaction.rollback()
                                    return Responder(res, HttpStatusCode.Forbidden, "Phone | Email or Password incorrect !")
                                }
                            })
                            .catch(err => {
                                transaction.rollback()
                                return Responder(res, HttpStatusCode.Forbidden, "Phone | Email or Password incorrect !")
                            })
                    } else {
                        transaction.rollback()
                        return Responder(res, HttpStatusCode.Forbidden, "Phone | Email or Password incorrect !")
                    }
                })
                .catch(err => Responder(res, HttpStatusCode.Conflict, err))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    authbank: async (req: Request, res: Response, next: NextFunction) => {
        const { phone, password } = req.body;
        const role = [6]// allowed roles to connect 

        try {

            const transaction = await connect.transaction();

            Users.belongsToMany(Roles, { through: Hasroles });
            Roles.belongsToMany(Users, { through: Hasroles });

            Provinces.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Provinces, { foreignKey: "idprovince" });

            Territoires.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Territoires, { foreignKey: "idterritoire" });

            Villages.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Villages, { foreignKey: "idvillage" });

            Users.findOne({
                where: {
                    [Op.or]: [
                        { email: phone },
                        { phone: fillphone({ phone }) }
                    ]
                },
                include: [
                    {
                        model: Roles,
                        required: true,
                        attributes: ['id', 'role']
                    },
                    {
                        model: Provinces,
                        required: false,
                        attributes: ['id', 'province']
                    },
                    {
                        model: Territoires,
                        required: false,
                        attributes: ['id', 'territoire']
                    },
                    {
                        model: Villages,
                        required: false,
                        attributes: ['id', 'village']
                    }
                ]
            })
                .then(user => {
                    if (user instanceof Users) {
                        const { password: aspassword, isvalidated, __tbl_ecom_roles } = user.toJSON() as any;
                        const roles = Array.from(__tbl_ecom_roles).map((role: any) => role['id']);
                        comparePWD({
                            hashedtext: aspassword || '',
                            plaintext: password
                        })
                            .then(verified => {
                                if (verified) {
                                    if (isvalidated === 1) {
                                        if (Array.from(roles).some(r => role.includes(r))) {
                                            Middleware.onSignin({
                                                expiresIn: APP_EXIPRES_IN_ADMIN || '45m',
                                                data: {
                                                    phone: user && user['phone'],
                                                    uuid: user && user['uuid'],
                                                    __id: user && user['id'],
                                                    roles
                                                }
                                            },
                                                async (reject: string, token: string) => {
                                                    if (token) {
                                                        const { id } = (user as any).toJSON() as any || {}
                                                        const coopec = await Cooperatives.findOne({
                                                            where: {
                                                                id_responsable: id
                                                            }
                                                        })
                                                        // user = formatUserModel({ model: user })
                                                        if (user !== null) {
                                                            if (user.hasOwnProperty('isvalidated')) {
                                                                delete user['isvalidated']
                                                            }
                                                            if (user.hasOwnProperty('password')) {
                                                                delete user['password']
                                                            }
                                                        }
                                                        if (coopec instanceof Cooperatives && user instanceof Users) {
                                                            const { id } = coopec.toJSON()
                                                            user = user.toJSON() as any
                                                            if (user !== null) {
                                                                (user as any)['id_cooperative'] = id as number
                                                            }
                                                        }
                                                        transaction.commit()
                                                        return Responder(res, HttpStatusCode.Ok, { token, user })
                                                    } else {
                                                        transaction.rollback()
                                                        return Responder(res, HttpStatusCode.Forbidden, "Your refresh token already expired ! you must login to get a new one !")
                                                    }
                                                })
                                        } else {
                                            transaction.rollback()
                                            return Responder(res, HttpStatusCode.Unauthorized, "You dont have right access please contact admin system !")
                                        }
                                    } else {
                                        transaction.rollback()
                                        return Responder(res, HttpStatusCode.NotAcceptable, "Account not validated !")
                                    }
                                } else {
                                    transaction.rollback()
                                    return Responder(res, HttpStatusCode.Forbidden, "Phone | Email or Password incorrect !")
                                }
                            })
                            .catch(err => {
                                transaction.rollback()
                                return Responder(res, HttpStatusCode.Forbidden, "Phone | Email or Password incorrect !")
                            })
                    } else {
                        transaction.rollback()
                        return Responder(res, HttpStatusCode.Forbidden, "Phone | Email or Password incorrect !")
                    }
                })
                .catch(err => Responder(res, HttpStatusCode.Conflict, err))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    register: async (req: Request, res: Response, next: NextFunction) => {
        const { nom, postnom, prenom, email, phone, adresse, idprovince, idterritoire, idvillage, date_naiss, genre, password, avatar, idroles } = req.body;

        try {
            const pwd = await hashPWD({ plaintext: password })
            const transaction = await connect.transaction();
            const uuid = uuidv4();

            Users.create({
                uuid,
                nom: capitalizeWords({ text: nom }),
                postnom: capitalizeWords({ text: postnom }),
                prenom: prenom ? capitalizeWords({ text: prenom }) : APP_ESCAPESTRING,
                email: email || fillphone({ phone }),
                phone: fillphone({ phone }),
                idprovince,
                idterritoire,
                idvillage,
                date_naiss,
                sexe: genre,
                password: pwd,
                isvalidated: 1
            }, { transaction })
                .then(user => {
                    if (user instanceof Users) {

                        user = user.toJSON();
                        delete user['password'];
                        delete user['idprovince'];
                        delete user['idterritoire'];
                        delete user['idvillage'];
                        delete user['isvalidated'];
                        const { id, } = user

                        Services.addRoleToUser({
                            inputs: {
                                idroles,
                                iduser: id
                            },
                            transaction,
                            cb: async (err: any, done: any) => {
                                if (done) {
                                    const { code } = done;
                                    if (code === 200) {

                                        if (email) {
                                            let chaine = JSON.stringify({
                                                email: email,
                                                phone: user['phone'],
                                            })
                                        }

                                        await Services.onSendSMS({
                                            is_flash: false,
                                            to: fillphone({ phone }),
                                            content: `Bonjour ${capitalizeWords({ text: nom })} votre compte a été crée avec succès. Ceci est votre mot de passe ${password}`,
                                        }).then(sms => {
                                            transaction.commit()
                                            return Responder(res, HttpStatusCode.Created, user)
                                        })
                                            .catch(er => {
                                                transaction.rollback()
                                                log(er)
                                                return Responder(res, HttpStatusCode.InternalServerError, "Role not initialized correctly !")
                                            })
                                    } else {
                                        transaction.rollback()
                                        return Responder(res, HttpStatusCode.InternalServerError, "Role not initialized correctly !")
                                    }
                                } else {
                                    transaction.rollback()
                                    return Responder(res, HttpStatusCode.InternalServerError, "Role not initialized correctly !")
                                }
                            }
                        })
                    } else return Responder(res, HttpStatusCode.BadRequest, user)
                })
                .catch(err => {
                    transaction.rollback()
                    const { name, errors } = err;
                    const { message } = errors[0];
                    return Responder(res, HttpStatusCode.Conflict, { name, error: message })
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    validate: async (req: Request, res: Response, next: NextFunction) => {
        let { iduser } = req.params;
        if (!iduser) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least iduser as paramter !")
        try {
            const transaction = await connect.transaction();

            Users.belongsToMany(Roles, { through: Hasroles });
            Roles.belongsToMany(Users, { through: Hasroles });

            Provinces.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Provinces, { foreignKey: "idprovince" });

            Territoires.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Territoires, { foreignKey: "idterritoire" });

            Villages.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Villages, { foreignKey: "idvillage" });

            Users.findOne({
                where: {
                    [Op.or]: [
                        { id: parseInt(iduser) },
                        { uuid: iduser }
                    ]
                },
                attributes: {
                    exclude: ['password', 'isvalidated', 'idprovince', 'idterritoire', 'idvillage']
                },
                include: [
                    {
                        model: Roles,
                        required: true,
                        attributes: ['id', 'role']
                    },
                    {
                        model: Provinces,
                        required: false,
                        attributes: ['id', 'province']
                    },
                    {
                        model: Territoires,
                        required: false,
                        attributes: ['id', 'territoire']
                    },
                    {
                        model: Villages,
                        required: false,
                        attributes: ['id', 'village']
                    }
                ]
            })
                .then(user => {
                    if (user instanceof Users) {
                        const { password: aspassword, isvalidated, phone, date_naiss, nom } = user?.toJSON()
                        if (isvalidated !== 1) {
                            user.update({
                                isvalidated: 1
                            })
                                .then(U => {
                                    Services.onSendSMS({
                                        to: fillphone({ phone }),
                                        content: `Bonjour ${capitalizeWords({ text: nom })} votre compte a été validé avec succès; vous pouvez maintenant acceder à la plateforme de ${APP_NAME}`,
                                        is_flash: false
                                    })
                                    transaction.commit()
                                    return Responder(res, HttpStatusCode.Ok, user)
                                })
                        } else {
                            transaction.rollback()
                            return Responder(res, HttpStatusCode.Conflict, "Account is still validated !")
                        }
                    } else {
                        transaction.rollback()
                        return Responder(res, HttpStatusCode.NotFound, "User not found in the list of users !")
                    }
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    profile: async (req: Request, res: Response, next: NextFunction) => {
        let { iduser } = req.params;
        if (!iduser) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least iduser as paramter !")
        try {
            const transaction = await connect.transaction();

            Users.belongsToMany(Roles, { through: Hasroles });
            Roles.belongsToMany(Users, { through: Hasroles });

            Provinces.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Provinces, { foreignKey: "idprovince" });

            Territoires.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Territoires, { foreignKey: "idterritoire" });

            Villages.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Villages, { foreignKey: "idvillage" });

            Users.findOne({
                where: {
                    [Op.or]: [
                        { id: parseInt(iduser) },
                        { uuid: iduser }
                    ]
                },
                attributes: {
                    exclude: ['password', 'isvalidated', 'idprovince', 'idterritoire', 'idvillage']
                },
                include: [
                    {
                        model: Roles,
                        required: true,
                        attributes: ['id', 'role']
                    },
                    {
                        model: Provinces,
                        required: false,
                        attributes: ['id', 'province']
                    },
                    {
                        model: Territoires,
                        required: false,
                        attributes: ['id', 'territoire']
                    },
                    {
                        model: Villages,
                        required: false,
                        attributes: ['id', 'village']
                    }
                ]
            })
                .then(user => {
                    if (user instanceof Users) {
                        const { password: aspassword, isvalidated, phone, date_naiss, nom } = user?.toJSON()
                        if (isvalidated !== 1) {
                            transaction.commit()
                            return Responder(res, HttpStatusCode.Ok, user)
                        } else {
                            transaction.rollback()
                            return Responder(res, HttpStatusCode.NotFound, {})
                        }
                    } else {
                        transaction.rollback()
                        return Responder(res, HttpStatusCode.NotFound, "User not found in the list of users !")
                    }
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    list: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const transaction = await connect.transaction();

            Users.belongsToMany(Roles, { through: Hasroles });
            Roles.belongsToMany(Users, { through: Hasroles });

            Provinces.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Provinces, { foreignKey: "idprovince" });

            Territoires.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Territoires, { foreignKey: "idterritoire" });

            Villages.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Villages, { foreignKey: "idvillage" });

            Users.findAll({
                where: {
                    // isvalidated: 1
                },
                attributes: {
                    exclude: ['password', 'isvalidated', 'idprovince', 'idterritoire', 'idvillage']
                },
                include: [
                    {
                        model: Roles,
                        required: true,
                        attributes: ['id', 'role'],
                    },
                    {
                        model: Provinces,
                        required: false,
                        attributes: ['id', 'province']
                    },
                    {
                        model: Territoires,
                        required: false,
                        attributes: ['id', 'territoire']
                    },
                    {
                        model: Villages,
                        required: false,
                        attributes: ['id', 'village']
                    }
                ]
            })
                .then(user => {
                    transaction.commit()
                    return Responder(res, HttpStatusCode.Ok, { count: user.length, rows: user })
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    listbyrole: async (req: Request, res: Response, next: NextFunction) => {
        const { idrole } = req.params
        if (!idrole) return Responder(res, HttpStatusCode.NotAcceptable, "THis request must have at least idrole as param !")
        try {
            const transaction = await connect.transaction();

            Users.belongsToMany(Roles, { through: Hasroles });
            Roles.belongsToMany(Users, { through: Hasroles });

            Provinces.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Provinces, { foreignKey: "idprovince" });

            Territoires.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Territoires, { foreignKey: "idterritoire" });

            Villages.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Villages, { foreignKey: "idvillage" });

            Users.findAll({
                where: {
                    isvalidated: 1
                },
                attributes: {
                    exclude: ['password', 'isvalidated', 'idprovince', 'idterritoire', 'idvillage']
                },
                include: [
                    {
                        model: Roles,
                        required: true,
                        attributes: ['id', 'role'],
                        where: {
                            id: parseInt(idrole)
                        }
                    },
                    {
                        model: Provinces,
                        required: false,
                        attributes: ['id', 'province']
                    },
                    {
                        model: Territoires,
                        required: false,
                        attributes: ['id', 'territoire']
                    },
                    {
                        model: Villages,
                        required: false,
                        attributes: ['id', 'village']
                    }
                ]
            })
                .then(user => {
                    transaction.commit()
                    return Responder(res, HttpStatusCode.Ok, { count: user.length, rows: user })
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    verify: async (req: Request, res: Response, next: NextFunction) => {
        const { id_user, verification_code } = req.body
        if (!id_user || !verification_code) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least !id_user || !verification_code")
        try {
            Users.hasOne(Extras, { foreignKey: "id_user" })
            Users.findOne({
                include: [
                    {
                        model: Extras,
                        required: true
                    }
                ],
                attributes: {
                    exclude: ['password']
                },
                where: {
                    [Op.or]: [
                        { id: parseInt(id_user) },
                        { phone: fillphone({ phone: id_user }) },
                        { uuid: id_user }
                    ]
                }
            })
                .then(user => {
                    if (user instanceof Users) {
                        const { isvalidated, __tbl_ecom_extra } = user.toJSON() as any
                        if (isvalidated === 0) {
                            const { verification } = __tbl_ecom_extra;
                            if (String(verification_code).trim() === String(verification).toString()) {
                                user.update({
                                    isvalidated: 1
                                })
                                    .then(U => {
                                        return Responder(res, HttpStatusCode.Ok, user)
                                    })
                                    .catch(Err => {
                                        return Responder(res, HttpStatusCode.BadRequest, Err)
                                    })
                            } else {
                                return Responder(res, HttpStatusCode.Forbidden, `Wrong code was used --- ${verification_code}`)
                            }
                        } else {
                            return Responder(res, HttpStatusCode.Conflict, "User is still verified !")
                        }
                    } else {
                        return Responder(res, HttpStatusCode.NotFound, "Record not found in Users ---list")
                    }
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    resendcode: async (req: Request, res: Response, next: NextFunction) => {
        const { id_user, verification_code } = req.body
        if (!id_user) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least !id_user")
        try {
            Users.hasOne(Extras, { foreignKey: "id_user" })
            Users.findOne({
                include: [
                    {
                        model: Extras,
                        required: true
                    }
                ],
                attributes: {
                    exclude: ['password']
                },
                where: {
                    [Op.or]: [
                        { id: parseInt(id_user) },
                        { phone: fillphone({ phone: id_user }) },
                        { uuid: id_user }
                    ]
                }
            })
                .then(user => {
                    if (user instanceof Users) {
                        const { isvalidated, __tbl_ecom_extra, phone, nom } = user.toJSON() as any
                        if (isvalidated === 0) {
                            const { verification } = __tbl_ecom_extra;
                            const code_ = verification || randomLongNumber({ length: 6 })
                            Services.onSendSMS({
                                is_flash: false,
                                to: fillphone({ phone }),
                                content: `Bonjour ${capitalizeWords({ text: nom })} votre compte a été crée avec succès. Ceci est votre code de vérirification ${code_}`,
                            })
                                .then(suc => {
                                    return Responder(res, HttpStatusCode.Ok, `New Verification code was sent to ${phone} user`)
                                })
                                .catch(err => {
                                    return Responder(res, HttpStatusCode.InternalServerError, err)
                                })
                        } else {
                            return Responder(res, HttpStatusCode.Conflict, "User is still verified !")
                        }
                    } else {
                        return Responder(res, HttpStatusCode.NotFound, "Record not found in Users ---list")
                    }
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    update: async (req: Request, res: Response, next: NextFunction) => {
        const { iduser } = req.params
        if (!iduser) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least iduser as param !")
        if (Object.keys(req.body).length <= 0) return Responder(res, HttpStatusCode.NotAcceptable, "The should not be empty")
        try {
            Users.update({
                ...req.body
            }, {
                where: {
                    id: parseInt(iduser)
                }
            })
                .then(U => {
                    return Responder(res, HttpStatusCode.Ok, U)
                })
                .catch(err => Responder(res, HttpStatusCode.InternalServerError, err))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    delete: async (req: Request, res: Response, next: NextFunction) => {
        const { iduser } = req.params;
        const transaction = null //await connect.transaction();

        try {
            const user = await Users.findOne({
                where: {
                    id: parseInt(iduser)
                },
                transaction
            });

            if (user instanceof Users) {
                const { id } = user.toJSON() as any
                await Hasroles.destroy({
                    transaction,
                    where: {
                        TblEcomUserId: id
                    }
                })
                    .then(D => {
                        Hasmembers.destroy({
                            transaction,
                            where: {
                                TblEcomUserId: id
                            }
                        })
                            .then(DD => {
                                Extras.destroy({
                                    transaction,
                                    where: {
                                        id_user: id
                                    }
                                })
                                    .then(DDD => {
                                        user.destroy()
                                            .then(DDDD => {
                                                // transaction.commit()
                                                return Responder(res, HttpStatusCode.Ok, `The user with id ${iduser} was successfuly deleted`)
                                            })
                                    })
                                    .catch(Err => {
                                        // transaction.rollback()
                                        return Responder(res, HttpStatusCode.InternalServerError, Err)
                                    })
                            })
                            .catch(Err => {
                                // transaction.rollback()
                                return Responder(res, HttpStatusCode.InternalServerError, Err)
                            })
                    })
                    .catch(Err => {
                        // transaction.rollback()
                        return Responder(res, HttpStatusCode.InternalServerError, Err)
                    })
            } else {
                // transaction.rollback()
                return Responder(res, HttpStatusCode.NotFound, `The user with id ${iduser} not found in the table user !`)
            }
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}