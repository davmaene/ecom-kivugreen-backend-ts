import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import base64 from 'base-64';
import { jwtDecode } from "jwt-decode";
import { log } from 'console';

dotenv.config();

const { APP_APAPPACCESKEY: APPAPIKEY, APP_COOKIESNAME: APPCOOKIESNAME } = process.env;

if (!APPAPIKEY || !APPCOOKIESNAME)
    throw Error("The variables APPAPIKEY or APPCOOKIESNAME is not defined in environement variable !")

export const exludedRoutes: string[] = [
    "/categories/list",
    "/users/user/signin",
    "/users/user/signup",
    "/users/user/auth",
    "/marketplace/commande",
    "/marketplace",
    "/provinces/list",
    "/villages/list",
    "/territoires/list",
    "/cooperatives/list",
    "/stocks/list",
    "/stocks/stock",
    "/typeslivraisons/list"
];

export const tries = 3;

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
                if (encoded) {
                    let tr: string
                    tr = encoded
                    for (let index = 0; index < tries; index++) {
                        tr = base64.encode(tr)
                    }
                    return cb(err, tr)
                } else {
                    return cb(err, undefined)
                }
            }
        )
    } catch (error) {
        return cb(error, undefined)
    }
};

export const onVerify: Function = async ({ token, req, res, next }: { token: string, req: Request, res: Response, next: NextFunction }, cb: Function) => {
    try {
        let tr: string
        tr = token
        for (let index = 0; index < tries; index++) {
            tr = base64.decode(tr)
        }
        jwt.verify(tr, APPAPIKEY, {}, (err, done) => {
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

export const onDecodeJWT = ({ encoded }: { encoded: string }): Promise<{ decoded: string, token: string }> => {
    return new Promise((resolve, rejected) => {
        let tr: string
        tr = encoded
        for (let index = 0; index < tries; index++) {
            tr = base64.decode(tr)
        }
        if (tr) return resolve({
            token: tr,
            decoded: jwtDecode(tr)
        })
        else return rejected({ token: null, decoded: null })
    })
};

export const Middleware = {
    onVerify,
    onSignin
};
