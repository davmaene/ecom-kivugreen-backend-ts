import { __controllerStocks } from '../__controllers/controller.stocks'
import express from 'express'

export const __routesStocks = express.Router()

__routesStocks.get('/list', __controllerStocks.list)
__routesStocks.get('/historiques/:id_cooperative', __controllerStocks.historiqueapprovisionnement)
__routesStocks.get('/register/:id_cooperative', __controllerStocks.getasregister)
__routesStocks.get('/byuser/historiques/:id_membre', __controllerStocks.historiqueapprovisionnementmembrecooperative)
__routesStocks.get('/stock/histories/:idstock', __controllerStocks.history)
__routesStocks.get('/stock/finished/:idstock', __controllerStocks.history)
__routesStocks.get('/stock/:idcooperative', __controllerStocks.getonebycoopec)
__routesStocks.get('/stock/byid/:idstock', __controllerStocks.getonebyid)
__routesStocks.post('/stock/in', __controllerStocks.in)