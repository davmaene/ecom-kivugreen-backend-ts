"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("config"));
class Database {
    constructor() {
        this.dbName = config_1.default.get('dbName');
        this.username = config_1.default.get('username');
        this.password = config_1.default.get('password');
        this.logging = config_1.default.get('logging');
        this.timeZone = config_1.default.get('timeZone');
        this.host = config_1.default.get('host');
        this.dialect = config_1.default.get('dialect');
        this.port = config_1.default.get('port');
    }
    static getInstance() {
        return this._instance;
    }
    set(sequelize) {
        this.sequence = sequelize;
    }
    get() {
        return this.sequence;
    }
}
Database._instance = new Database();
exports.default = Database;
