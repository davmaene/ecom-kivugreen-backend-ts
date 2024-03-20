import express from "express";
import { __routesUsers } from "./routes.users";
import { __routesRoles } from "./routes.roles";
import { __routesServices } from "./routes.services";
import { __routesCooperatives } from "./routes.cooperatives";
import { __routesProvinces } from "./routes.provinces";
import { __routesTerritoires } from "./routes.territoires";
import { __routesProduits } from "./routes.produits";
import { __routesCategories } from "./routes.categories";
import { __routesSouscategories } from "./routes.souscategories";
import { __rouetesUnities } from "./routes.unitiesmesures";
import { __routesStocks } from "./routes.stocks";

export const routes = express.Router();

routes.use('/users', __routesUsers)
routes.use('/roles', __routesRoles)
routes.use('/services', __routesServices)
routes.use('/cooperatives', __routesCooperatives)
routes.use('/provinces', __routesProvinces)
routes.use('/territoires', __routesTerritoires)
routes.use('/produits', __routesProduits)
routes.use('/categories', __routesCategories)
routes.use('/souscategories', __routesSouscategories)
routes.use('/unities', __rouetesUnities)
routes.use('/stocks', __routesStocks)

