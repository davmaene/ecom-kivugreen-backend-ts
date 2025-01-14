import { Newsletters } from '../__models/model.newsletters';
import { HttpStatusCode } from '../__enums/enum.httpsstatuscode';
import { fillphone } from '../__helpers/helper.fillphone';
import { Responder } from '../__helpers/helper.responseserver';
import { Services } from '../__services/serives.all';
import { NextFunction, Response, Request } from 'express';
import { log } from 'console';
import { ServiceImage } from '../__services/services.images';
import { Carousels } from '../__models/model.carousel';
import { date } from '../__helpers/helper.moment';

export const __controllerServices = {
    deletecarousel: async (req: Request, res: Response, next: NextFunction) => {
        const { id_carousel } = req.params;
        if (!id_carousel || isNaN(id_carousel as any)) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least id_carousel !")
        try {
            Carousels.findOne({
                where: {
                    status: 1,
                    id: id_carousel
                }
            })
                .then(car => {
                    if (car instanceof Carousels) {
                        car.destroy()
                            .then(_ => Responder(res, HttpStatusCode.Ok, `Item:::${id_carousel} successfuly deleted !`))
                            .catch(_ => Responder(res, HttpStatusCode.Ok, `Item:::${id_carousel} error occured !`))
                    } else {
                        return Responder(res, HttpStatusCode.NotFound, `Item:::${id_carousel} not found !`)
                    }
                })
                .catch(err => Responder(res, HttpStatusCode.InternalServerError, err))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    update: async (req: Request, res: Response, next: NextFunction) => {
        const { id_carousel } = req.params;
        if (!id_carousel || isNaN(id_carousel as any)) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least id_carousel !")
        if (Object.keys(req.body).length <= 0) return Responder(res, HttpStatusCode.NotAcceptable, "The body can not be empty")
        try {
            Carousels.findOne({
                where: {
                    status: 1,
                    id: id_carousel
                }
            })
                .then(car => {
                    if (car instanceof Carousels) {
                        car.update({
                            ...req.body as any
                        })
                            .then(_ => Responder(res, HttpStatusCode.Ok, `Item:::${id_carousel} successfuly deleted !`))
                            .catch(_ => Responder(res, HttpStatusCode.Ok, `Item:::${id_carousel} error occured !`))
                    } else {
                        return Responder(res, HttpStatusCode.NotFound, `Item:::${id_carousel} not found !`)
                    }
                })
                .catch(err => Responder(res, HttpStatusCode.InternalServerError, err))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    listcarousels: async (req: Request, res: Response, next: NextFunction) => {
        try {
            Carousels.findAll({
                order: [
                    ['id', 'DESC']
                ],
                where: {
                    status: 1
                }
            })
                .then(list => {
                    return Responder(res, HttpStatusCode.Ok, { count: list.length, rows: list })
                })
                .catch(err => Responder(res, HttpStatusCode.InternalServerError, err))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    addcarousel: async (req: Request, res: Response, next: NextFunction) => {
        const { title, description, sub_title } = req.body;
        if (!req.files) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least image of carousel !")
        if (!req.files.carousel) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least image of carousel !")
        if (!title || !description) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least title, description, sub_title !")
        const { currentuser } = req as any;
        const { __id, roles, uuid } = currentuser;
        try {
            ServiceImage.onUploadImage({
                inputs: {
                    file: req,
                    saveas: 'image',
                    type: 'carousel'
                },
                callBack: (err: any, done: any) => {
                    log(err, done)
                    if (done) {
                        const { code, message, data } = done
                        if (code === 200) {
                            const { filename, fullpath } = data;
                            Carousels.create({
                                createdBy: __id,
                                carousel: fullpath,
                                description,
                                title,
                                sub_title,
                                createdAt: date(),
                                status: 1
                            })
                                .then(car => {
                                    if (car instanceof Carousels) return Responder(res, HttpStatusCode.Ok, car)
                                    else return Responder(res, HttpStatusCode.BadRequest, car)
                                })
                                .catch(err => {
                                    return Responder(res, HttpStatusCode.InternalServerError, err)
                                })
                        } else {
                            return Responder(res, HttpStatusCode.InternalServerError, err)
                        }
                    } else {
                        return Responder(res, HttpStatusCode.InternalServerError, err)
                    }
                }
            })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    onsendsms: async (req: Request, res: Response, next: NextFunction) => {
        const { message, to } = req.body;
        // const p = await Services.calcProductPrice({ tva: 16, unit_price: 3500 })
        // log(p)
        try {
            Services.onSendSMS({
                to: fillphone({ phone: to }),
                content: message,
                is_flash: false
            })
                .then((sms: any) => {
                    const { code, message, data } = sms
                    return Responder(res, code, data)
                })
                .catch(er => {
                    return Responder(res, HttpStatusCode.InternalServerError, er)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    subscribetonewsletter: async (req: Request, res: Response, next: NextFunction) => {
        const { email, description } = req.body;
        if (!email) return Responder(res, HttpStatusCode.NotAcceptable, "this request must have at least email !")
        try {
            Newsletters.create({
                email,
                description
            })
                .then(news => {
                    if (news instanceof Newsletters) {
                        return Responder(res, HttpStatusCode.Ok, news)
                    } else {
                        return Responder(res, HttpStatusCode.InternalServerError, news)
                    }
                })
                .catch(err => {
                    return Responder(res, HttpStatusCode.InternalServerError, err.toString())
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}