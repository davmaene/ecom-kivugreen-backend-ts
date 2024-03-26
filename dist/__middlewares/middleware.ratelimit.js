"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.limiterSignup = exports.limiterVerify = exports.limiterResend = exports.limiterSignin = exports.createRateLimiter = exports.rateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { APP_PORT, APP_COOKIESNAME, APP_RATELIMITMAXREQS, APP_RATELIMITTIMING } = process.env;
const msSignin = 5, msVerify = 3, msSignup = 6, msResendcode = 2;
if (!APP_RATELIMITMAXREQS || !APP_RATELIMITTIMING)
    throw Error("The variable APP_RATELIMIT is not definied in ");
const rateLimiter = (nrqst, { req, res, next }) => {
    console.log(nrqst);
    return (0, express_rate_limit_1.default)({
        windowMs: (nrqst) * 60 * 1000,
        max: parseInt(APP_RATELIMITMAXREQS),
        standardHeaders: false,
        legacyHeaders: false
    });
};
exports.rateLimiter = rateLimiter;
const createRateLimiter = (time) => {
    return (0, express_rate_limit_1.default)({
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
exports.createRateLimiter = createRateLimiter;
exports.limiterSignin = (0, exports.createRateLimiter)(msSignin);
exports.limiterResend = (0, exports.createRateLimiter)(msResendcode);
exports.limiterVerify = (0, exports.createRateLimiter)(msVerify);
exports.limiterSignup = (0, exports.createRateLimiter)(msSignup);
