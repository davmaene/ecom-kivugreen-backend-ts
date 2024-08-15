import { __controllerTypelivraison } from '../__controllers/controller.typelivraison'
import express from 'express'

export const __routesTypelivraison = express.Router()

__routesTypelivraison.get("/list", __controllerTypelivraison.list)
__routesTypelivraison.put("/typeslivraison/:id", __controllerTypelivraison.update)
__routesTypelivraison.delete("/typeslivraison/:id", __controllerTypelivraison.delete)
__routesTypelivraison.post("/typeslivraison/add", __controllerTypelivraison.add)