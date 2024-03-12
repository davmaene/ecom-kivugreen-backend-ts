import config from 'config';
import { Sequelize } from 'sequelize';
class Database {
    private static _instance = new Database();
    dbName: string;
    username: string;
    password: string;
    logging: boolean;
    timeZone: string;
    host: string;
    sequence: any;
    port: number;
    dialect: any;

    constructor() {
        this.dbName = config.get('dbName');
        this.username = config.get('username');
        this.password = config.get('password');
        this.logging = config.get('logging');
        this.timeZone = config.get('timeZone');
        this.host = config.get('host');
        this.dialect = config.get('dialect');
        this.port = config.get('port');
    }

    public static getInstance(): Database {
        return this._instance;
    }
    set(sequelize: Sequelize) {
        this.sequence = sequelize;
    }
    get(): Sequelize {
        return this.sequence;
    }
}

export default Database;