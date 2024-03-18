import express from 'express'
import { __controllerProvinces } from '../__controllers/controller.provinces'

export const __routesProvinces = express.Router()
__routesProvinces.get('/list', __controllerProvinces.list)