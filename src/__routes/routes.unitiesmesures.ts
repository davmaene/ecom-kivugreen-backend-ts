import { __controllerUnities } from '../__controllers/controller.unitiesmesures'
import express from 'express'

export const __rouetesUnities = express.Router()
__rouetesUnities.get("/list", __controllerUnities.list)
__rouetesUnities.post("/unity/add", __controllerUnities.add)
__rouetesUnities.put("/unity/:id", __controllerUnities.update)
__rouetesUnities.delete("/unity/:id", __controllerUnities.delete)