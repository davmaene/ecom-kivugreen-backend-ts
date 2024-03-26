"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__routesProvinces = void 0;
const express_1 = __importDefault(require("express"));
const controller_provinces_1 = require("../__controllers/controller.provinces");
exports.__routesProvinces = express_1.default.Router();
exports.__routesProvinces.get('/list', controller_provinces_1.__controllerProvinces.list);
