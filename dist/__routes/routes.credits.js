"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__routesCredits = void 0;
const middleware_datavalidator_1 = require("../__middlewares/middleware.datavalidator");
const controller_credits_1 = require("../__controllers/controller.credits");
const express_1 = __importDefault(require("express"));
exports.__routesCredits = express_1.default.Router();
exports.__routesCredits.get("/list", controller_credits_1.__controllersCredits.list);
exports.__routesCredits.post("/credit/add", (0, middleware_datavalidator_1.onValidate)(middleware_datavalidator_1.creditModelValidator), controller_credits_1.__controllersCredits.add);
exports.__routesCredits.get("/bystatus/:status", controller_credits_1.__controllersCredits.listbystatus);
exports.__routesCredits.put("/credit/:idcredit", controller_credits_1.__controllersCredits.update);
exports.__routesCredits.delete("/credit/:idcredit", controller_credits_1.__controllersCredits.delete);
