import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const { APPAPIKEY, APPCOOKIESNAME } = process.env;

export const exludedRoutes = [
    "/users/user/signup",
    "/users/user/signin",
    "/users/user/verify",
    "/users/user/resendcode",
]

export const optionsSignin = {
    expiresIn: '14h',
    jwtid: '993'.toString()
}

export const onSignin = async ({ data }, cb) => {
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

export const onVerify = async ({ token, req, res, next }, cb) => {
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
    onSignin,
    exludedRoutes
}