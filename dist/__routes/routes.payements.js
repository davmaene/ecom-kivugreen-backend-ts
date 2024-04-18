"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__routesPayements = void 0;
const controller_payements_1 = require("../__controllers/controller.payements");
const express_1 = __importDefault(require("express"));
exports.__routesPayements = express_1.default.Router();
exports.__routesPayements.get("/list", controller_payements_1.__controllerPayements.list);
exports.__routesPayements.get("/list/bystatus/:idstatus", controller_payements_1.__controllerPayements.listbystatus);
exports.__routesPayements.get("/list/byowner", controller_payements_1.__controllerPayements.listbyowner);
exports.__routesPayements.post("/payement/makepayement", controller_payements_1.__controllerPayements.makepayement);
