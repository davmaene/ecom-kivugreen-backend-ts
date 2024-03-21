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
Object.defineProperty(exports, "__esModule", { value: true });
exports.__controllerServices = void 0;
const enum_httpsstatuscode_1 = require("../__enums/enum.httpsstatuscode");
const helper_fillphone_1 = require("../__helpers/helper.fillphone");
const helper_responseserver_1 = require("../__helpers/helper.responseserver");
const serives_all_1 = require("../__services/serives.all");
exports.__controllerServices = {
    onsendsms: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { message, to } = req.body;
        try {
            serives_all_1.Services.onSendSMS({
                to: (0, helper_fillphone_1.fillphone)({ phone: to }),
                content: message,
                is_flash: false
            })
                .then((sms) => {
                const { code, message, data } = sms;
                return (0, helper_responseserver_1.Responder)(res, code, data);
            })
                .catch(er => {
                return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, er);
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    })
};
