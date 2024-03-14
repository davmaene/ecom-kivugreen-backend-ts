import nodemailer from 'nodemailer';
import mailConfig from '../../config/configMail'
import ejs from 'ejs';
import path from 'path';
import { Request } from 'express';






const transporter = nodemailer.createTransport(
    {
        service: 'Gmail',
        auth: {
            user: mailConfig.ADMIN_MAIL,
            pass: mailConfig.ADMIN_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false,
        },
    }
);

export const sendFeedbackDestroyFacture = async (req: Request | any) => {
    const browserInfo = {
        userAgent: req.headers['user-agent'],
        browser: req.headers['sec-ch-ua'],
        language: req.headers['accept-language'],
        platform: req.headers['sec-ch-ua-platform']
    };
    const expirationDate = new Date(Date.now() + 5 * 30 * 24 * 60 * 60 * 1000);
    transporter.sendMail({
        from: mailConfig.ADMIN_MAIL,
        to: 'gentilakili98@gmail.com',
        subject: `FACTURE N°`,
        html: await ejs.renderFile(path.join(__dirname, 'templeteMail.ejs'), {

        }),
        headers: {
            'expiration-date': expirationDate.toUTCString()
        }
    }, (error: any, info: any) => {
        if (error) {
            return error;
        } else {
            return info.response
        }
    });
}