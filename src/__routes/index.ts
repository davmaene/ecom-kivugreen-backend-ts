import express from "express";
import { __routesUsers } from "./routes.users";

export const routes = express.Router();
routes.use('/users', __routesUsers)
