"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__routesAssets = void 0;
const express_1 = __importDefault(require("express"));
const controller_assets_1 = require("../__controllers/controller.assets");
exports.__routesAssets = express_1.default.Router();
exports.__routesAssets.get("/as_avatar/:ressources", controller_assets_1.__controlerAssets.getressoursesavatar);
exports.__routesAssets.get("/as_assets/:ressources", controller_assets_1.__controlerAssets.getanyressourses);
