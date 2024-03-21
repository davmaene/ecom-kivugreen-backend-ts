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
exports.comparePWD = exports.hashPWD = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { APP_SALTLENGTH } = process.env;
if (!APP_SALTLENGTH)
    throw Error("The variable APP_SALTLENGTH is not defined in path variable");
const hashPWD = ({ plaintext }) => __awaiter(void 0, void 0, void 0, function* () {
    return bcrypt_1.default.hash(plaintext, parseInt(APP_SALTLENGTH));
});
exports.hashPWD = hashPWD;
const comparePWD = ({ plaintext, hashedtext }) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (typeof plaintext !== 'string') {
                return reject('plaintext is not defined');
            }
            const valide = yield bcrypt_1.default.compare(plaintext, hashedtext);
            if (valide)
                return resolve(valide);
            else
                reject('error pwd not matching');
        }
        catch (error) {
            reject(error);
        }
    }));
});
exports.comparePWD = comparePWD;
