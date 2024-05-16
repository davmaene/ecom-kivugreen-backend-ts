import { HttpStatusMessages } from './../__enums/enum.httpsmessage';
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import * as dotenv from 'dotenv'
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import * as fs from 'fs';
import http from 'http';
import * as path from 'path';
import morgan from 'morgan';
import fileUpload from 'express-fileupload'
import { accessValidator } from "../__middlewares/middleware.accessvalidator";
import { routes } from "../__routes/index";
import { ServiceImage } from '../__services/services.images';
import { log } from 'console';
import { Server, Socket } from 'socket.io';

dotenv.config();

const { APP_NAME, APP_PORT, APP_VERSION } = process.env;

const app = express();
const server = http.createServer(app);
const PORT = APP_PORT || 8012;
const io = new Server(server)

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
    return Responder(res, HttpStatusCode.Ok, { ...HttpStatusMessages })
});

app.use('/api', accessValidator, routes); //

app.use("/__assets", routes);

app.use("/assets", routes);

app.use((req: Request, res: Response, next: NextFunction) => {
    const { url, method, body } = req
    return Responder(res, HttpStatusCode.NotFound, {
        url,
        method,
        body
    })
});

io.on('connection', (socket: Socket) => {
    console.log('Nouvelle connexion:', socket.id);
    // Gérer les messages des clients
    socket.on('message', (data: any) => {
        console.log('Message reçu:', data);
        // Envoyer le message à tous les clients sauf l'émetteur
        socket.broadcast.emit('message', data);
    });

    // Gérer la déconnexion des clients
    socket.on('disconnect', () => {
        console.log('Déconnexion:', socket.id);
    });
});

app.listen(PORT, () => {
    console.log(`< ========== > ${APP_NAME} TEST APP ON ${APP_PORT} < ========== >`);
});

