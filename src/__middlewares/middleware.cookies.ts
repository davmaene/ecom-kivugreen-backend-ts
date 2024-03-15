import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express'

dotenv.config();

const { APP_APAPPACCESKEY: APPAPIKEY, APP_COOKIESNAME: APPCOOKIESNAME } = process.env;

if (!APPAPIKEY || !APPCOOKIESNAME)
    throw Error("The variables APPAPIKEY or APPCOOKIESNAME is not defined in environement variable !")

export const exludedRoutes: string[] = [
    "/users/user/register",
    "/users/user/auth",
];

export const optionsSignin: any = {
    expiresIn: '14h',
    jwtid: '993'.toString()
};

export const onSignin: Function = async ({ data }: { data: any }, cb: Function) => {
    try {
        jwt.sign({
            ...data
        },
            APPAPIKEY,
            { ...optionsSignin },
            (err, encoded) => {
                return cb(err, encoded)
            }
        )
    } catch (error) {
        return cb(error, undefined)
    }
};

export const onVerify: Function = async ({ token, req, res, next }: { token: string, req: Request, res: Response, next: NextFunction }, cb: Function) => {
    try {
        jwt.verify(token, APPAPIKEY, {}, (err, done) => {
            if (done) {
                return cb(undefined, done)
            } else {
                return cb(err, undefined)
            }
        })
    } catch (error) {
        return cb(error, undefined)
    }
};

export const Middleware = {
    onVerify,
    onSignin
}
