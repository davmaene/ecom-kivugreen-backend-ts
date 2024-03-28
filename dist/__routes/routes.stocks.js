"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__routesStocks = void 0;
const controller_stocks_1 = require("../__controllers/controller.stocks");
const express_1 = __importDefault(require("express"));
exports.__routesStocks = express_1.default.Router();
exports.__routesStocks.get('/list', controller_stocks_1.__controllerStocks.list);
exports.__routesStocks.get('/stock/:idcooperative', controller_stocks_1.__controllerStocks.getonebycoopec);
exports.__routesStocks.post('/stock/in', controller_stocks_1.__controllerStocks.in);
