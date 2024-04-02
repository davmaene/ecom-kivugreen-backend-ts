"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__routesMembers = void 0;
const controller_members_1 = require("../__controllers/controller.members");
const express_1 = __importDefault(require("express"));
exports.__routesMembers = express_1.default.Router();
exports.__routesMembers.get("/list", controller_members_1.__controllerMembers.list);
exports.__routesMembers.get("/list/bycooperative/:idcooperative", controller_members_1.__controllerMembers.listbycooperative);
