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
    retry: {
        match: [/Deadlock/i],
        max: 3,
        backoffBase: 1000,
        backoffExponent: 1.5
    },
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
        // console.log("Connected successfuly to db ..." + dbName, ' on port ==> ', port);
        // connect
        //     .sync({ alter: true, force: true })
        //     .then(() => {
        //         console.log("Models were synchronized successfully to DB ====> " + dbName);
        //     })
        //     .catch((error) => {
        //         console.log(`Failed to sync all models ${error.message}`);
        //     });
    })
    .catch((error) => {
        console.log(`Failed to connect to bd ${error}`);
    });
