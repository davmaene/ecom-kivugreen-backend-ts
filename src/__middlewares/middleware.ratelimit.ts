import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const { APPPORT, APPCOOKIESNAME, APPRATELIMITMAXREQS, APPRATELIMITTIMING } = process.env;
const msSignin = 5, msVerify = 3, msSignup = 6, msResendcode = 2;

export const rateLimiter = (nrqst, { req, res, next }) => {
    console.log(nrqst);
    return rateLimit({
        windowMs: parseInt(nrqst) * 60 * 1000,
        max: parseInt(APPRATELIMITMAXREQS),
        standardHeaders: false,
        legacyHeaders: false
    })
}

export const createRateLimiter = (time) => {
    return rateLimit({
        windowMs: parseInt(time) * 60 * 1000,
        max: parseInt(time),
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