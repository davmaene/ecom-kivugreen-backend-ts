"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__routesTypelivraison = void 0;
const controller_typelivraison_1 = require("../__controllers/controller.typelivraison");
const express_1 = __importDefault(require("express"));
exports.__routesTypelivraison = express_1.default.Router();
exports.__routesTypelivraison.get("/list", controller_typelivraison_1.__controllerTypelivraison.list);