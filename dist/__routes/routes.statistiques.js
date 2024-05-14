"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__routesStatistiques = void 0;
const controller_statistics_1 = require("../__controllers/controller.statistics");
const express_1 = __importDefault(require("express"));
exports.__routesStatistiques = express_1.default.Router();
exports.__routesStatistiques.get("/stat/dashboard", controller_statistics_1.__controlerStatistics.dashboard);
