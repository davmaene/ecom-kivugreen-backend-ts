"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomString = exports.randomLongNumberWithPrefix = exports.randomLongNumber = exports.generateFilename = exports.generateIdentifier = void 0;
const lib_1 = require("ts-randomstring/lib");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { APP_NAME: APPNAME } = process.env;
const generateIdentifier = ({ prefix }) => {
    const pfx = Math.floor(Math.random() * 1000);
    const sfx = Math.floor(Math.random() * 100);
    return `${prefix ? String(prefix).toUpperCase().concat("-") : ""}${(0, exports.randomLongNumber)({ length: 6 })}`;
};
exports.generateIdentifier = generateIdentifier;
const generateFilename = ({ prefix, tempname }) => {
    const extension = tempname.substring(tempname.lastIndexOf("."));
    return `${prefix ? prefix + "-" : ""}${(0, lib_1.generateRandomString)({ length: 23 })}${extension}`;
};
exports.generateFilename = generateFilename;
const randomLongNumber = ({ length }) => {
    const len = length && !isNaN((length)) ? length : 6;
    const ret = [];
    for (let k = 0; k < len; k++)
        ret.push(Math.floor(Math.random() * 10));
    let m = ret.join().toString();
    m = m.replace(/,/g, "");
    return m.trim();
};
exports.randomLongNumber = randomLongNumber;
const randomLongNumberWithPrefix = ({ length }) => {
    const prefix = APPNAME;
    const len = length && !isNaN((length)) ? length : 6;
    const ret = [];
    for (let k = 0; k < len; k++)
        ret.push(Math.floor(Math.random() * 10));
    let m = ret.join().toString();
    m = m.replace(/,/g, "");
    return `${prefix}${m.trim()}`;
};
exports.randomLongNumberWithPrefix = randomLongNumberWithPrefix;
const randomString = () => (0, lib_1.generateRandomString)({ length: 32 });
exports.randomString = randomString;
