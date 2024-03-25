import { __controllerTypelivraison } from '../__controllers/controller.typelivraison'
import express from 'express'

export const __routesTypelivraison = express.Router()
__routesTypelivraison.get("/list", __controllerTypelivraison.list)