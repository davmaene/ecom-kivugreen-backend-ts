import { __controllerMarketplace } from '../__controllers/controller.marketplaces'
import express from 'express'

export const __routesMarketplace = express.Router()
__routesMarketplace.get('/', __controllerMarketplace.marketplace)
__routesMarketplace.post('/command', __controllerMarketplace.placecommand)