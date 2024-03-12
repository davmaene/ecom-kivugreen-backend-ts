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
exports.sendFeedbackDestroyFacture = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const configMail_1 = __importDefault(require("../../config/configMail"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const transporter = nodemailer_1.default.createTransport({
    service: 'Gmail',
    auth: {
        user: configMail_1.default.ADMIN_MAIL,
        pass: configMail_1.default.ADMIN_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
});
const sendFeedbackDestroyFacture = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const browserInfo = {
        userAgent: req.headers['user-agent'],
        browser: req.headers['sec-ch-ua'],
        language: req.headers['accept-language'],
        platform: req.headers['sec-ch-ua-platform']
    };
    const expirationDate = new Date(Date.now() + 5 * 30 * 24 * 60 * 60 * 1000);
    transporter.sendMail({
        from: configMail_1.default.ADMIN_MAIL,
        to: 'gentilakili98@gmail.com',
        subject: `FACTURE N°`,
        html: yield ejs_1.default.renderFile(path_1.default.join(__dirname, 'templeteMail.ejs'), {}),
        headers: {
            'expiration-date': expirationDate.toUTCString()
        }
    }, (error, info) => {
        if (error) {
            return error;
        }
        else {
            return info.response;
        }
    });
});
exports.sendFeedbackDestroyFacture = sendFeedbackDestroyFacture;
