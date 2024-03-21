"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.excludedRoutes = exports.optionsCookies = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { APP_RATELIMIT } = process.env;
if (!APP_RATELIMIT)
    throw Error("APP_RATELIMIT is not defined as environement variable !");
exports.optionsCookies = {
    maxAge: 1000 * 60 * parseInt(APP_RATELIMIT), // would expire after 15 minutes
    httpOnly: true, // The cookie only accessible by the web server
    signed: true // Indicates if the cookie should be signed
};
exports.excludedRoutes = [
    '/auth/signin'
];
