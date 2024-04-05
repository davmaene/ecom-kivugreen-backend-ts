import { __controllerServices } from '../__controllers/controller.services'
import express from 'express'

export const __routesServices = express.Router()

__routesServices.post("/service/sendsms", __controllerServices.onsendsms)
__routesServices.post("/service/newsletters", __controllerServices.subscribetonewsletter)