"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accessValidator = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const middleware_cookies_1 = require("./middleware.cookies");
const helper_responseserver_1 = require("../__helpers/helper.responseserver");
const enum_httpsstatuscode_1 = require("../__enums/enum.httpsstatuscode");
dotenv_1.default.config();
const { APP_CONNEXIONTOAPPWEB, APP_CONNEXIONTOAPPMOB } = process.env;
if (!APP_CONNEXIONTOAPPMOB || !APP_CONNEXIONTOAPPWEB)
    throw Error("Connexion from web or mobile missing !");
const accessValidator = (req, res, next) => {
    let { headers, url } = req;
    url = String(url).includes("/list") ? String(url).substring(0, String(url).lastIndexOf("/list") + 5) : url;
    url = String(url).includes("?") ? String(url).substring(0, String(url).indexOf("?")) : String(url);
    if (String(url).includes("by/"))
        return next();
    if (headers && url) {
        if (middleware_cookies_1.exludedRoutes.indexOf(url) === -1) {
            if (headers && headers.hasOwnProperty(APP_CONNEXIONTOAPPWEB)) {
                const authorization = String(headers[APP_CONNEXIONTOAPPWEB]);
                const _isfrom_mob = String(headers[APP_CONNEXIONTOAPPMOB]);
                if (authorization && authorization.includes("Bearer ")) {
                    if (_isfrom_mob === 'true')
                        return next();
                    (0, middleware_cookies_1.onVerify)({
                        token: authorization.split(" ")[1].trim(),
                        next,
                        req,
                        res
                    }, (err, done) => {
                        if (done) {
                            req.currentuser = Object.assign({}, done);
                            return next();
                        }
                        else {
                            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Unauthorized, "Your Token has expired !");
                        }
                    });
                }
                else
                    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Unauthorized, "Your don't have access to this ressource !");
            }
            else {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Unauthorized, "Your don't have access to this ressource !");
            }
        }
        else {
            return next();
        }
    }
    else
        return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Unauthorized, "Your don't have access to this ressource !");
};
exports.accessValidator = accessValidator;
