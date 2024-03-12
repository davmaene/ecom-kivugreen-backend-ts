import { Sequelize } from "sequelize";
import Database from "./database";

const database = Database.getInstance();
const { dbName, username, password, logging, dialect, host, port } = database;

export const connect = new Sequelize(
    dbName,
    username,
    password, {
    port,
    host,
    dialect,
    logging,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}
);
connect
    .authenticate()
    .then(() => {
        console.log("Connected successfuly to db ..." + dbName, ' on port ==> ',);
    })
    .catch((error) => {
        console.log(`Failed to connect... ${error}`);
    });
