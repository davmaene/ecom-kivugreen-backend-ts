import { Response, NextFunction, Request } from 'express'
import dotenv from "dotenv";
import { HttpStatusCode } from '../__enums/enum.httpsstatuscode';
import { HttpStatusMessages } from '../__enums/enum.httpsmessage';

dotenv.config();

const { APP_NAME } = process.env;

export const Responder = (res: Response, status: number, body: any) => {
    if (1 && res && status) {
        if (!APP_NAME) {
            throw new Error("APP_NAME is not defined in the environment variables");
        }

        res.setHeader("responsefrom_", APP_NAME);

        return res.status(status).json({
            status,
            message: HttpStatusMessages[status],
            data: body || {}
        })

    } else {
        return res.status(HttpStatusCode.BadRequest).json({
            status: HttpStatusCode.BadRequest,
            message: HttpStatusMessages[HttpStatusCode.BadRequest],
            data: {}
        });
    }
}