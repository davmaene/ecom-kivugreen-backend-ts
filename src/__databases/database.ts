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
        this.dbName = config.get<string>('dbName');
        this.username = config.get<string>('username');
        this.password = config.get<string>('password');
        this.logging = config.get<boolean>('logging');
        this.timeZone = config.get<string>('timeZone');
        this.host = config.get<string>('host');
        this.dialect = config.get<any>('dialect');
        this.port = config.get<number>('port');
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