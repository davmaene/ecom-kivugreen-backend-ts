"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Middleware = exports.onDecodeJWT = exports.onVerify = exports.onSignin = exports.optionsSignin = exports.tries = exports.exludedRoutes = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const base_64_1 = __importDefault(require("base-64"));
const jwt_decode_1 = require("jwt-decode");
dotenv_1.default.config();
const { APP_APAPPACCESKEY: APPAPIKEY, APP_COOKIESNAME: APPCOOKIESNAME } = process.env;
if (!APPAPIKEY || !APPCOOKIESNAME)
    throw Error("The variables APPAPIKEY or APPCOOKIESNAME is not defined in environement variable !");
exports.exludedRoutes = [
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
exports.tries = 3;
exports.optionsSignin = {
    expiresIn: '14h',
    jwtid: '993'.toString()
};
const onSignin = ({ data }, cb) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        jsonwebtoken_1.default.sign(Object.assign({}, data), APPAPIKEY, Object.assign({}, exports.optionsSignin), (err, encoded) => {
            if (encoded) {
                let tr;
                tr = encoded;
                for (let index = 0; index < exports.tries; index++) {
                    tr = base_64_1.default.encode(tr);
                }
                return cb(err, tr);
            }
            else {
                return cb(err, undefined);
            }
        });
    }
    catch (error) {
        return cb(error, undefined);
    }
});
exports.onSignin = onSignin;
const onVerify = ({ token, req, res, next }, cb) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let tr;
        tr = token;
        for (let index = 0; index < exports.tries; index++) {
            tr = base_64_1.default.decode(tr);
        }
        jsonwebtoken_1.default.verify(tr, APPAPIKEY, {}, (err, done) => {
            if (done) {
                return cb(undefined, done);
            }
            else {
                return cb(err, undefined);
            }
        });
    }
    catch (error) {
        return cb(error, undefined);
    }
});
exports.onVerify = onVerify;
const onDecodeJWT = ({ encoded }) => {
    try {
        let tr;
        tr = encoded;
        for (let index = 0; index < exports.tries; index++) {
            tr = base_64_1.default.decode(tr);
        }
        return ({
            token: tr,
            decoded: (0, jwt_decode_1.jwtDecode)(tr)
        });
    }
    catch (error) {
        return ({
            token: null,
            decoded: null
        });
    }
};
exports.onDecodeJWT = onDecodeJWT;
exports.Middleware = {
    onVerify: exports.onVerify,
    onSignin: exports.onSignin
};
