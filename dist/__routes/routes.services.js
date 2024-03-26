"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__routesServices = void 0;
const controller_services_1 = require("../__controllers/controller.services");
const express_1 = __importDefault(require("express"));
exports.__routesServices = express_1.default.Router();
exports.__routesServices.post("/service/sendsms", controller_services_1.__controllerServices.onsendsms);
