import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { Request, NextFunction, Response } from 'express';

dotenv.config();

const { APP_PORT, APP_COOKIESNAME, APP_RATELIMITMAXREQS, APP_RATELIMITTIMING } = process.env;
const msSignin = 5, msVerify = 3, msSignup = 6, msResendcode = 2;

if (!APP_RATELIMITMAXREQS || !APP_RATELIMITTIMING)
    throw Error("The variable APP_RATELIMIT is not definied in ")

export const rateLimiter = (nrqst: number, { req, res, next }: { req: Request, res: Response, next: NextFunction }): Function => {
    console.log(nrqst);
    return rateLimit({
        windowMs: (nrqst) * 60 * 1000,
        max: parseInt(APP_RATELIMITMAXREQS),
        standardHeaders: false,
        legacyHeaders: false
    })
}

export const createRateLimiter = (time: number): Function => {
    return rateLimit({
        windowMs: (time) * 60 * 1000,
        max: (time),
        standardHeaders: false,
        legacyHeaders: false,
        message: {
            status: 429,
            message: "Too many requests please try again in " + time + " minutes",
            data: null
        }
    });
};

export const limiterSignin = createRateLimiter(msSignin)
export const limiterResend = createRateLimiter(msResendcode)
export const limiterVerify = createRateLimiter(msVerify)
export const limiterSignup = createRateLimiter(msSignup)