import { __controllerMarketplace } from '../__controllers/controller.marketplaces'
import express from 'express'

export const __routesMarketplace = express.Router()

__routesMarketplace.get('/', __controllerMarketplace.marketplace)
__routesMarketplace.get('/product/:idproduit', __controllerMarketplace.marketplaceoneproductbyid)
__routesMarketplace.post('/command', __controllerMarketplace.placecommand)
__routesMarketplace.post('/command/retry', __controllerMarketplace.replacecommande)
__routesMarketplace.post('/card/addtopanier', __controllerMarketplace.addtopanier)
__routesMarketplace.post('/card/validate/:idpanier', __controllerMarketplace.addtopanier)
__routesMarketplace.get('/by/keyword/:keyword', __controllerMarketplace.searchbykeyword)
__routesMarketplace.get('/by/cooperative/:keyword', __controllerMarketplace.searchbycooperative)
__routesMarketplace.get('/by/province/:keyword', __controllerMarketplace.searchbyprovince)
__routesMarketplace.get('/by/category/:keyword', __controllerMarketplace.searchbycategory)