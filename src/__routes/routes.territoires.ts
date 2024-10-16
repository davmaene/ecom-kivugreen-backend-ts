import { __controllerTerritoires } from '../__controllers/controller.territoires'
import express from 'express'

export const __routesTerritoires = express.Router()
__routesTerritoires.get("/list", __controllerTerritoires.list)
__routesTerritoires.get("/listbyprovince/:idprovince", __controllerTerritoires.listbyprovince)
__routesTerritoires.get("/list/by/:idprovince", __controllerTerritoires.listbyprovince)