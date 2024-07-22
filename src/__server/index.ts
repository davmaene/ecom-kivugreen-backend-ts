import { HttpStatusMessages } from './../__enums/enum.httpsmessage';
import express, { NextFunction, Request, Response, Application } from "express";
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

const app: Application = express();
const server = http.createServer(app);
const PORT = APP_PORT || 8012;
const ___logAccess = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        // allowedHeaders: ["x-ecommerce-kgreen-api"],
        // credentials: true
    }
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
}));

app.use((req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    const { url, method, body, query, params, ip, ips } = req
    log({
        url,
        method,
        body,
        query,
        params,
        ip,
        ips
    })
    // next();
    return Responder(res, HttpStatusCode.Ok, req.body)
});

app.use(morgan("combined", { stream: ___logAccess }));

io.on('connection', (socket: Socket) => {
    console.log('A user connected', socket.id);
    io.emit('pairingdone', socket.id);

    socket.on('scanned', (data) => {
        log(data)
    })

    socket.on('message', (msg) => {
        console.log('Received message:', msg);
        socket.send('Message received');
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

app.get('/', (req: Request, res: Response, next: NextFunction) => {
    return Responder(res, HttpStatusCode.Ok, { ...HttpStatusMessages })
});
app.use("/__assets", routes);
app.use("/assets", routes);
app.use("/src", routes);
app.use('/api', accessValidator, routes); //

app.use((req: Request, res: Response, next: NextFunction) => {
    const { url, method, body } = req
    return Responder(res, HttpStatusCode.NotFound, {
        url,
        method,
        body
    })
});

server.listen(PORT, () => {
    console.log(`< ========== > ${APP_NAME} TEST APP ON ${APP_PORT} < ========== >`);
});

