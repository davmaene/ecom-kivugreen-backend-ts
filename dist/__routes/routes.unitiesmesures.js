"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__rouetesUnities = void 0;
const controller_unitiesmesures_1 = require("../__controllers/controller.unitiesmesures");
const express_1 = __importDefault(require("express"));
exports.__rouetesUnities = express_1.default.Router();
exports.__rouetesUnities.get("/list", controller_unitiesmesures_1.__controllerUnities.list);
exports.__rouetesUnities.post("/unity/add", controller_unitiesmesures_1.__controllerUnities.add);
