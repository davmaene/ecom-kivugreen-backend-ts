"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__routesSouscategories = void 0;
const controller_souscategories_1 = require("../__controllers/controller.souscategories");
const express_1 = __importDefault(require("express"));
exports.__routesSouscategories = express_1.default.Router();
exports.__routesSouscategories.get('/list', controller_souscategories_1.__controllerSouscategories.list);
exports.__routesSouscategories.post('/souscategorie/add', controller_souscategories_1.__controllerSouscategories.add);
