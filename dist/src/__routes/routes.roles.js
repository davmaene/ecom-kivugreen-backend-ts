"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__routesRoles = void 0;
const controller_roles_1 = require("../__controllers/controller.roles");
const express_1 = __importDefault(require("express"));
exports.__routesRoles = express_1.default.Router();
exports.__routesRoles.get('/list', controller_roles_1.__controllerRoles.list);
exports.__routesRoles.post('/role/add', controller_roles_1.__controllerRoles.add);
exports.__routesRoles.put('/role/addtouser', controller_roles_1.__controllerRoles.addtouser);
