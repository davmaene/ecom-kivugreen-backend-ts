import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import * as dotenv from 'dotenv'
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import * as fs from 'fs';
import * as path from 'path';
import morgan from 'morgan';

dotenv.config();

const { APP_NAME, APP_PORT, APP_VERSION } = process.env;

const app = express();
const PORT = APP_PORT || 8012;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use((req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, PATCH, POST, DELETE, GET");
        res.status(200).json({});
    }
    next();
});

const ___logAccess = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

app.use(morgan("combined", { stream: ___logAccess }));

app.use('/', (req: Request, res: Response, next: NextFunction) => {
    return Responder(res, HttpStatusCode.Accepted, {
        app: APP_NAME,
        version: APP_VERSION
    })
})

app.use((req: Request, res: Response, next: NextFunction) => {
    const { url, method, body } = req
    return Responder(res, HttpStatusCode.NotFound, {
        url,
        method,
        body
    })
});

app.listen(PORT, () => {
    console.log(`< ========== ${APP_NAME} TEST APP ON ${APP_PORT} ========== >`);
});

