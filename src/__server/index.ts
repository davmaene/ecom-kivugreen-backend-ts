import { HttpStatusMessages } from './../__enums/enum.httpsmessage';
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import * as dotenv from 'dotenv'
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import * as fs from 'fs';
import * as path from 'path';
import morgan from 'morgan';
import fileUpload from 'express-fileupload'
import { accessValidator } from "../__middlewares/middleware.accessvalidator";
import { routes } from "../__routes/index";
import { ServiceImage } from '../__services/services.images';
import { log } from 'console';

dotenv.config();

const { APP_NAME, APP_PORT, APP_VERSION } = process.env;

const app = express();
const PORT = APP_PORT || 8012;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
}));

app.use((req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

const ___logAccess = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

app.use(morgan("combined", { stream: ___logAccess }));

app.get('/', (req: Request, res: Response, next: NextFunction) => {
    ServiceImage.onRemoveBGFromImage({
        inputs: {
            directory: '/',
            filename: 'image-bAWMArU5VYl15KFjDSK6nvz.jpg',
            fullpath: "src/__assets/as_images/image-bAWMArU5VYl15KFjDSK6nvz.jpg",
            saveas: 'as_images'
        },
        callBack: (err: any, done: any) => {
            log(done, err)
        }
    })
    return Responder(res, HttpStatusCode.Ok, { ...HttpStatusMessages })
})

app.use('/api', accessValidator, routes) //

app.use((req: Request, res: Response, next: NextFunction) => {
    const { url, method, body } = req
    return Responder(res, HttpStatusCode.NotFound, {
        url,
        method,
        body
    })
});

app.listen(PORT, () => {
    console.log(`< ========== > ${APP_NAME} TEST APP ON ${APP_PORT} < ========== >`);
});

