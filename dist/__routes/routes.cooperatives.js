"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__routesCooperatives = void 0;
const controller_cooperatives_1 = require("../__controllers/controller.cooperatives");
const middleware_datavalidator_1 = require("../__middlewares/middleware.datavalidator");
const express_1 = __importDefault(require("express"));
exports.__routesCooperatives = express_1.default.Router();
exports.__routesCooperatives.get("/list", controller_cooperatives_1.__controllerCooperatives.list);
exports.__routesCooperatives.post("/cooperative/add", (0, middleware_datavalidator_1.onValidate)(middleware_datavalidator_1.coopecModelValidator), controller_cooperatives_1.__controllerCooperatives.add);
exports.__routesCooperatives.put("/cooperative/addmembers", controller_cooperatives_1.__controllerCooperatives.addmemebers);
exports.__routesCooperatives.put("/cooperative/:idcooperative", controller_cooperatives_1.__controllerCooperatives.update);
exports.__routesCooperatives.delete("/cooperative/:idcooperative", controller_cooperatives_1.__controllerCooperatives.delete);
exports.__routesCooperatives.get("/cooperative/:idcooperative", controller_cooperatives_1.__controllerCooperatives.getonebyid);
