"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__routesVillages = void 0;
const controller_villages_1 = require("../__controllers/controller.villages");
const express_1 = __importDefault(require("express"));
exports.__routesVillages = express_1.default.Router();
exports.__routesVillages.get("/list", controller_villages_1.__controllerVillages.list);
exports.__routesVillages.get("/list/byterritory/:idterritoire", controller_villages_1.__controllerVillages.listbyterritoire);
