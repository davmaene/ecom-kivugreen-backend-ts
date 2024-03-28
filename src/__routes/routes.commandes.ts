import { __controllerMarketplace } from '../__controllers/controller.marketplaces'
import { __controllerCommandes } from '../__controllers/controller.commandes'
import express from 'express'

export const __routesCommandes = express.Router()

__routesCommandes.get("/list", __controllerCommandes.list)
__routesCommandes.get("/list/bystate/:status/", __controllerCommandes.listbystate)
__routesCommandes.get("/list/byowner", __controllerCommandes.listbyowner)
__routesCommandes.post("/commande/add", __controllerMarketplace.placecommand)
__routesCommandes.post("/commande/add", __controllerMarketplace.placecommand)