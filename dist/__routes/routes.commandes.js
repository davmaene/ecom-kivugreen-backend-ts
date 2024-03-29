"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__routesCommandes = void 0;
const controller_marketplaces_1 = require("../__controllers/controller.marketplaces");
const controller_commandes_1 = require("../__controllers/controller.commandes");
const express_1 = __importDefault(require("express"));
exports.__routesCommandes = express_1.default.Router();
exports.__routesCommandes.get("/list", controller_commandes_1.__controllerCommandes.list);
exports.__routesCommandes.get("/list/bystate/:status/", controller_commandes_1.__controllerCommandes.listbystate);
exports.__routesCommandes.get("/list/byowner", controller_commandes_1.__controllerCommandes.listbyowner);
exports.__routesCommandes.post("/commande/add", controller_marketplaces_1.__controllerMarketplace.placecommand);
exports.__routesCommandes.put("/commande/validate/:idcommande", controller_commandes_1.__controllerCommandes.validate);
