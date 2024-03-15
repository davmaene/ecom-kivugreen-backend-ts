import dotenv from 'dotenv';
import { Request, NextFunction, Response } from 'express'
import { exludedRoutes, onVerify } from './middleware.cookies';
import { Responder } from '__helpers/helper.responseserver';

dotenv.config();

const { CONNEXIONTOAPPWEB, CONNEXIONTOAPPMOB } = process.env;

if (!CONNEXIONTOAPPMOB || !CONNEXIONTOAPPWEB) throw Error("Connexion from web or mobile missing !")

export const accessValidator = ({ req, res, next }: { req: Request, res: Response, next: NextFunction }) => {
    const { headers, url } = req;
    if (headers && url) {

        if (exludedRoutes.indexOf(url) === -1) {
            if (headers && headers.hasOwnProperty(CONNEXIONTOAPPWEB)) {

                const authorization = headers[CONNEXIONTOAPPWEB];
                const _isfrom_mob = headers[CONNEXIONTOAPPMOB];
                const { apikey, accesskey } = headers;

                if (authorization && authorization.includes("Bearer ")) {
                    if (_isfrom_mob === 'true') return next();

                    onVerify({
                        token: authorization.split(" ")[1].trim() || "",
                        next,
                        req,
                        res
                    }, (err, done) => {
                        if (done) {
                            req.currentuser = { ...done };
                            return next();
                        } else {
                            return Responder(res, 403, "Your Token has expired !")
                        }
                    })

                } else return Responder(res, 403, "Your don't have access to this ressource !")
            } else {
                return Responder(res, 403, "Your don't have access to this ressource !")
            }
        } else {
            return next()
        }
    } else return Responder(res, 403, "Your don't have access to this ressource !")
}