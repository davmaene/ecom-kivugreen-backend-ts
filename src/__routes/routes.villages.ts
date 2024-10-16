import { __controllerVillages } from '../__controllers/controller.villages'
import express from 'express'

export const __routesVillages = express.Router()

__routesVillages.get("/list", __controllerVillages.list)
__routesVillages.get("/list/byterritory/:idterritoire", __controllerVillages.listbyterritoire)
__routesVillages.get("/list/by/:idterritoire", __controllerVillages.listbyterritoire)