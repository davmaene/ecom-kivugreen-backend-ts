import { __controllerCommandes } from '../__controllers/controller.commandes'
import express from 'express'

export const __routesCommandes = express.Router()
__routesCommandes.get("/list", __controllerCommandes.list)
__routesCommandes.get("/list/bystate/:state", __controllerCommandes.listbystate)