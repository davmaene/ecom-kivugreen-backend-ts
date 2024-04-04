import dotenv from 'dotenv';
import { Request, NextFunction, Response } from 'express'
import { exludedRoutes, onVerify } from './middleware.cookies';
import { Responder } from '../__helpers/helper.responseserver';
import { HttpStatusCode } from '../__enums/enum.httpsstatuscode';
import { log } from 'console';

dotenv.config();

const { APP_CONNEXIONTOAPPWEB, APP_CONNEXIONTOAPPMOB } = process.env;

if (!APP_CONNEXIONTOAPPMOB || !APP_CONNEXIONTOAPPWEB)
    throw Error("Connexion from web or mobile missing !");

export const accessValidator = (req: Request, res: Response, next: NextFunction) => {
    let { headers, url }: any = req as any;
    url = String(url).includes("/list") ?  String(url).substring(0, String(url).lastIndexOf("/list") + 5) : url;
    url = String(url).includes("/list") ?  String(url).substring(0, String(url).lastIndexOf("/list") + 5) : url;
    
    if(String(url).includes("by/")) return next()

    if (headers && url) {
        if (exludedRoutes.indexOf(url) === -1) {
            if (headers && headers.hasOwnProperty(APP_CONNEXIONTOAPPWEB)) {

                const authorization = String(headers[APP_CONNEXIONTOAPPWEB]);
                const _isfrom_mob = String(headers[APP_CONNEXIONTOAPPMOB]);

                if (authorization && authorization.includes("Bearer ")) {
                    if (_isfrom_mob === 'true') return next();

                    onVerify({
                        token: authorization.split(" ")[1].trim(),
                        next,
                        req,
                        res
                    }, (err: any, done: any) => {
                        if (done) {
                            (req as any).currentuser = { ...done };
                            return next();
                        } else {
                            return Responder(res, HttpStatusCode.Unauthorized, "Your Token has expired !")
                        }
                    })
                } else return Responder(res, HttpStatusCode.Unauthorized, "Your don't have access to this ressource !")
            } else {
                return Responder(res, HttpStatusCode.Unauthorized, "Your don't have access to this ressource !")
            }
        } else {
            return next()
        }
    } else return Responder(res, HttpStatusCode.Unauthorized, "Your don't have access to this ressource !")
}