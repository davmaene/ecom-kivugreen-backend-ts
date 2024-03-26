"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__routesConfigurations = void 0;
const controller_configs_1 = require("../__controllers/controller.configs");
const express_1 = __importDefault(require("express"));
exports.__routesConfigurations = express_1.default.Router();
exports.__routesConfigurations.put("/configuration", controller_configs_1.__controllerConfigs.add);
exports.__routesConfigurations.get("/get", controller_configs_1.__controllerConfigs.get);
