import { __controllerMarketplace } from '../__controllers/controller.marketplaces'
import { __controllerCommandes } from '../__controllers/controller.commandes'
import express from 'express'

export const __routesCommandes = express.Router()

__routesCommandes.get("/list", __controllerCommandes.list)
__routesCommandes.get("/list/bystate/:status", __controllerCommandes.listbystate)
__routesCommandes.get("/list/byowner", __controllerCommandes.listbyowner)
__routesCommandes.get("/list/transactions/byowner", __controllerCommandes.listtransaction)
__routesCommandes.get("/list/bytransaction/:idtransaction", __controllerCommandes.listcommandebytransaction)
__routesCommandes.get("/list/bycooperative/:idcooperative", __controllerCommandes.listcommandebycooperative)
__routesCommandes.get("/list/bycooperativeandstate/:idcooperative/:state", __controllerCommandes.listcommandebycooperativeandstate)
__routesCommandes.post("/commande/add", __controllerMarketplace.placecommand)
__routesCommandes.put("/commande/validate/:idcommande", __controllerCommandes.validate)
__routesCommandes.put("/commande/changestate/:idcommande", __controllerCommandes.changestate)
