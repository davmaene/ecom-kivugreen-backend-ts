import { onValidate, produitValidator } from '../__middlewares/middleware.datavalidator'
import { __controllerProduits } from '../__controllers/controller.produits'
import express from 'express'

export const __routesProduits = express.Router()

__routesProduits.post('/produit/add', onValidate(produitValidator), __controllerProduits.add)
__routesProduits.get('/list', __controllerProduits.list)
__routesProduits.put('/produit/:idproduit', __controllerProduits.update)
__routesProduits.delete('/produit/:idproduit', __controllerProduits.delete)