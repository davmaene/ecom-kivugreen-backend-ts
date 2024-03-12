import dotenv from 'dotenv';
dotenv.config()

const { APP_RATELIMIT } = process.env

if(!APP_RATELIMIT) throw Error("APP_RATELIMIT is not defined as environement variable !")

export const optionsCookies = {
    maxAge: 1000 * 60 * parseInt(APP_RATELIMIT), // would expire after 15 minutes
    httpOnly: true, // The cookie only accessible by the web server
    signed: true // Indicates if the cookie should be signed
};

export const excludedRoutes = [
    '/auth/signin'
];