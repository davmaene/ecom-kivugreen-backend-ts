import { __controllerConfigs } from '../__controllers/controller.configs'
import express from 'express'

export const __routesConfigurations = express.Router()
__routesConfigurations.put("/configuration", __controllerConfigs.add)