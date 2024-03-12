"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_routes_1 = __importDefault(require("./action/index.routes"));
const router = (0, express_1.Router)();
(0, index_routes_1.default)(router);
exports.default = router;
