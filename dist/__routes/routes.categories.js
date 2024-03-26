"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__routesCategories = void 0;
const controller_categories_1 = require("../__controllers/controller.categories");
const express_1 = __importDefault(require("express"));
exports.__routesCategories = express_1.default.Router();
exports.__routesCategories.get('/list', controller_categories_1.__controllerCategories.list);
exports.__routesCategories.post('/categorie/add', controller_categories_1.__controllerCategories.add);
