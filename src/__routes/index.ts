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
import { __routesMarketplace } from "./routes.marketplace";
import { __routesCommandes } from "./routes.commandes";
import { __routesConfigurations } from "./routes.configurations";
import { __routesVillages } from "./routes.villages";
import { __routesTypelivraison } from "./routes.typelivraisons";
import { __routesAssets } from "./routes.assets";
import { __routesBanks } from "./routes.banks";
import { __routesCredits } from "./routes.credits";
import { __routesCategcoope } from "./routes.categcooperatives";
import { __routesMembers } from "./routes.memebers";
import { __routesPayements } from "./routes.payements";
import { __routesStatistiques } from "./routes.statistiques";

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
routes.use('/marketplace', __routesMarketplace)
routes.use('/commandes', __routesCommandes)
routes.use('/configurations', __routesConfigurations)
routes.use('/villages', __routesVillages)
routes.use('/typeslivraisons', __routesTypelivraison)
routes.use('/banks', __routesBanks)
routes.use('/credits', __routesCredits)
routes.use('/coopeccategs', __routesCategcoope)
routes.use('/members', __routesMembers)
routes.use('/payements', __routesPayements)
routes.use('/statistiques', __routesStatistiques)

routes.use("/", __routesAssets)


