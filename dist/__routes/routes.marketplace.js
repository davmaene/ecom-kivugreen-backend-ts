"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__routesMarketplace = void 0;
const controller_marketplaces_1 = require("../__controllers/controller.marketplaces");
const express_1 = __importDefault(require("express"));
exports.__routesMarketplace = express_1.default.Router();
exports.__routesMarketplace.get('/', controller_marketplaces_1.__controllerMarketplace.marketplace);
exports.__routesMarketplace.post('/command', controller_marketplaces_1.__controllerMarketplace.placecommand);
exports.__routesMarketplace.post('/card/addtopanier', controller_marketplaces_1.__controllerMarketplace.addtopanier);
exports.__routesMarketplace.post('/card/validate/:idpanier', controller_marketplaces_1.__controllerMarketplace.addtopanier);
exports.__routesMarketplace.get('/by/keyword/:keyword', controller_marketplaces_1.__controllerMarketplace.searchbykeyword);
exports.__routesMarketplace.get('/by/cooperative/:keyword', controller_marketplaces_1.__controllerMarketplace.searchbycooperative);
exports.__routesMarketplace.get('/by/province/:keyword', controller_marketplaces_1.__controllerMarketplace.searchbyprovince);
