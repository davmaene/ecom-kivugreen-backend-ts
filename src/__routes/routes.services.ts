import { __controllerServices } from '../__controllers/controller.services'
import express from 'express'

export const __routesServices = express.Router()

__routesServices.post("/service/sendsms", __controllerServices.onsendsms)
__routesServices.post("/service/newsletters", __controllerServices.subscribetonewsletter)
__routesServices.get("/carousels", __controllerServices.listcarousels)
__routesServices.post("/carousel/add", __controllerServices.addcarousel)
__routesServices.put("/carousel/:id_carousel", __controllerServices.update)
__routesServices.delete("/carousel/:id_carousel", __controllerServices.deletecarousel)