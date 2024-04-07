import { __controllerPayements } from '../__controllers/controller.payements'
import express from 'express'

export const __routesPayements = express.Router()

__routesPayements.get("/list", __controllerPayements.list)
__routesPayements.get("/list/byowner", __controllerPayements.listbyowner)
__routesPayements.post("/payement/makepayement", __controllerPayements.makepayement)