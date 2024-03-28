"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__routesBanks = void 0;
const middleware_datavalidator_1 = require("../__middlewares/middleware.datavalidator");
const controller_banks_1 = require("../__controllers/controller.banks");
const express_1 = __importDefault(require("express"));
exports.__routesBanks = express_1.default.Router();
exports.__routesBanks.get("/list", controller_banks_1.__controllerBanks.list);
exports.__routesBanks.post("/bank/add", (0, middleware_datavalidator_1.onValidate)(middleware_datavalidator_1.bankModelValidator), controller_banks_1.__controllerBanks.add);
exports.__routesBanks.put("/bank/:idbank", controller_banks_1.__controllerBanks.update);
exports.__routesBanks.delete("/bank/:idbank", controller_banks_1.__controllerBanks.delete);
