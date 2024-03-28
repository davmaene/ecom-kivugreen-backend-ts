import { __controllerCategscooperatives } from '../__controllers/controller.categscoopec'
import express from 'express'

export const __routesCategcoope = express.Router()

__routesCategcoope.get("/list", __controllerCategscooperatives.list)
__routesCategcoope.post("/coopeccateg/add", __controllerCategscooperatives.add)
__routesCategcoope.put("/coopeccateg/:idcateg", __controllerCategscooperatives.update)
__routesCategcoope.delete("/coopeccateg/:idcateg", __controllerCategscooperatives.delete)