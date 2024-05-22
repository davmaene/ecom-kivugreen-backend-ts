"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const enum_httpsmessage_1 = require("./../__enums/enum.httpsmessage");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
const enum_httpsstatuscode_1 = require("../__enums/enum.httpsstatuscode");
const helper_responseserver_1 = require("../__helpers/helper.responseserver");
const fs = __importStar(require("fs"));
const http_1 = __importDefault(require("http"));
const path = __importStar(require("path"));
const morgan_1 = __importDefault(require("morgan"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const middleware_accessvalidator_1 = require("../__middlewares/middleware.accessvalidator");
const index_1 = require("../__routes/index");
const socket_io_1 = require("socket.io");
dotenv.config();
const { APP_NAME, APP_PORT, APP_VERSION } = process.env;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const PORT = APP_PORT || 8012;
const io = new socket_io_1.Server(server);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use((0, express_fileupload_1.default)({
    limits: { fileSize: 50 * 1024 * 1024 },
}));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});
const ___logAccess = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use((0, morgan_1.default)("combined", { stream: ___logAccess }));
app.get('/', (req, res, next) => {
    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.Ok, Object.assign({}, enum_httpsmessage_1.HttpStatusMessages));
});
app.use('/api', middleware_accessvalidator_1.accessValidator, index_1.routes); //
app.use("/__assets", index_1.routes);
app.use("/assets", index_1.routes);
app.use((req, res, next) => {
    const { url, method, body } = req;
    return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.NotFound, {
        url,
        method,
        body
    });
});
io.on('connection', (socket) => {
    console.log('Nouvelle connexion:', socket.id);
    // Gérer les messages des clients
    socket.on('message', (data) => {
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
