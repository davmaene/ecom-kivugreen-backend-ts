"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__routesProduits = void 0;
const middleware_datavalidator_1 = require("../__middlewares/middleware.datavalidator");
const controller_produits_1 = require("../__controllers/controller.produits");
const express_1 = __importDefault(require("express"));
exports.__routesProduits = express_1.default.Router();
exports.__routesProduits.post('/produit/add', (0, middleware_datavalidator_1.onValidate)(middleware_datavalidator_1.produitValidator), controller_produits_1.__controllerProduits.add);
exports.__routesProduits.get('/list', controller_produits_1.__controllerProduits.list);
exports.__routesProduits.put('/produit/:idproduit', controller_produits_1.__controllerProduits.update);
exports.__routesProduits.delete('/produit/:idproduit', controller_produits_1.__controllerProduits.delete);
