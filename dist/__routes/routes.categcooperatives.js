"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__routesCategcoope = void 0;
const controller_categscoopec_1 = require("../__controllers/controller.categscoopec");
const express_1 = __importDefault(require("express"));
exports.__routesCategcoope = express_1.default.Router();
exports.__routesCategcoope.get("/list", controller_categscoopec_1.__controllerCategscooperatives.list);
exports.__routesCategcoope.post("/coopeccateg/add", controller_categscoopec_1.__controllerCategscooperatives.add);
exports.__routesCategcoope.put("/coopeccateg/:idcateg", controller_categscoopec_1.__controllerCategscooperatives.update);
exports.__routesCategcoope.delete("/coopeccateg/:idcateg", controller_categscoopec_1.__controllerCategscooperatives.delete);
