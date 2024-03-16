import express from "express";
import { __routesUsers } from "./routes.users";
import { __routesRoles } from "./routes.roles";
import { __routesServices } from "./routes.services";

export const routes = express.Router();
routes.use('/users', __routesUsers)
routes.use('/roles', __routesRoles)
routes.use('/services', __routesServices)
