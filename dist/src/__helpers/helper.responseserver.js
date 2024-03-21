"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Responder = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const enum_httpsstatuscode_1 = require("../__enums/enum.httpsstatuscode");
const enum_httpsmessage_1 = require("../__enums/enum.httpsmessage");
dotenv_1.default.config();
const { APP_NAME } = process.env;
const Responder = (res, status, body) => {
    if (1 && res && status) {
        if (!APP_NAME) {
            throw new Error("APP_NAME is not defined in the environment variables");
        }
        res.setHeader("responsefrom_", APP_NAME);
        return res.status(status).json({
            status,
            message: enum_httpsmessage_1.HttpStatusMessages[status],
            data: body || {}
        });
    }
    else {
        return res.status(enum_httpsstatuscode_1.HttpStatusCode.BadRequest).json({
            status: enum_httpsstatuscode_1.HttpStatusCode.BadRequest,
            message: enum_httpsmessage_1.HttpStatusMessages[enum_httpsstatuscode_1.HttpStatusCode.BadRequest],
            data: {}
        });
    }
};
exports.Responder = Responder;
