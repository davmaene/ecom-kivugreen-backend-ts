import { connect } from '../__databases/connecte';
import { fillphone } from '../__helpers/helper.fillphone';
import { Users } from '../__models/model.users';
import { Hasroles } from '../__models/model.hasroles';
import { Provinces } from '../__models/model.provinces';
import { Roles } from '../__models/model.roles';
import { Request, Response, NextFunction } from 'express'
import { Territoires } from '../__models/model.territoires';
import { Villages } from '../__models/model.villages';
import { Op } from 'sequelize';
import { comparePWD } from '../__helpers/helper.passwords';
import { randomLongNumber } from '../__helpers/helper.random';
import { Responder } from '../__helpers/helper.responseserver';
import { HttpStatusCode } from '../__enums/enum.httpsstatuscode';
import { Middleware } from '../__middlewares/middleware.cookies';
import { formatUserModel } from '../__helpers/helper.all';
import dotenv from 'dotenv';

dotenv.config()

const { APP_EXIPRES_IN_ADMIN, APP_EXIPRES_IN_ALL } = process.env

export const __controllerUsers = {
    auth: async (req: Request, res: Response, next: NextFunction) => {
        const { phone, password } = req.body;

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
                    isvalidated: 1,
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
                        attributes: ['id', 'territoire']
                    }
                ]
            })
                .then(user => {
                    if (user instanceof Users) {
                        const { password: aspassword, isvalidated, phone, date_naiss } = user.toJSON()
                        if (isvalidated === 1) {
                            comparePWD({
                                hashedtext: aspassword || '',
                                plaintext: password
                            }).then(verified => {
                                if (verified) {

                                    Middleware.onSignin({
                                        expiresIn: APP_EXIPRES_IN_ADMIN || '45m',
                                        data: {
                                            phone: user && user['phone'],
                                            uuid: user && user['uuid'],
                                            __id: user && user['id'],
                                            // role: user && user['__tbl_roles']
                                        }
                                    }, (reject: string, token: string) => {
                                        if (token) {

                                            user = formatUserModel({ model: user })
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
                                    return Responder(res, HttpStatusCode.Forbidden, "Phone | Email or Password incorrect !")
                                }
                            })
                        } else {
                            const code = randomLongNumber({ length: 6 })
                            // user.update({
                            //     verificationcode: code
                            // })
                            //     .then(uss => {
                            //         Services.SMSServices({
                            //             is_flash: false,
                            //             to: fillphone({ phone: user && user['phone'] }),
                            //             content: `MK-${code} \nBonjour ${capitalizeWords({ text: user && user['nom'] })} votre compte n'est pas encore verifié. Ceci est votre code de vérification`,
                            //         });
                            //         transaction.rollback()
                            //         return Responder(res, 400, `${fillphone({ phone })} is not verified ! a new code was sent to user`)
                            //     })
                            //     .catch(error => {
                            //         transaction.rollback()
                            //         return Responder(res, HttpStatusCode.Forbidden, "Phone | Email or Password incorrect !")
                            //     })
                        }
                    } else {
                        transaction.rollback()
                        return Responder(res, HttpStatusCode.Forbidden, "Phone | Email or Password incorrect !")
                    }
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    register: async (req: Request, res: Response, next: NextFunction) => {

    }
}