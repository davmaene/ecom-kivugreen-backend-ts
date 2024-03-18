import express from "express";
import { __routesUsers } from "./routes.users";
import { __routesRoles } from "./routes.roles";
import { __routesServices } from "./routes.services";
import { __routesCooperatives } from "./routes.cooperatives";
import { __routesProvinces } from "./routes.provinces";

export const routes = express.Router();

routes.use('/users', __routesUsers)
routes.use('/roles', __routesRoles)
routes.use('/services', __routesServices)
routes.use('/cooperatives', __routesCooperatives)
routes.use('/provinces', __routesProvinces)
