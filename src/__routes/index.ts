import express from "express";
import { __routesUsers } from "./routes.users";
import { __routesRoles } from "./routes.roles";

export const routes = express.Router();
routes.use('/users', __routesUsers)
routes.use('/roles', __routesRoles)
