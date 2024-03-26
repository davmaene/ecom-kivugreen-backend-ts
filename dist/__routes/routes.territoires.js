"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__routesTerritoires = void 0;
const controller_territoires_1 = require("../__controllers/controller.territoires");
const express_1 = __importDefault(require("express"));
exports.__routesTerritoires = express_1.default.Router();
exports.__routesTerritoires.get("/list", controller_territoires_1.__controllerTerritoires.list);
exports.__routesTerritoires.get("/listbyprovince/:idprovince", controller_territoires_1.__controllerTerritoires.listbyprovince);
