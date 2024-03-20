import { __controllerStocks } from '../__controllers/controller.stocks'
import express from 'express'

export const __routesStocks = express.Router()
__routesStocks.get('/list', __controllerStocks.list)
__routesStocks.get('/stock/in', __controllerStocks.in)