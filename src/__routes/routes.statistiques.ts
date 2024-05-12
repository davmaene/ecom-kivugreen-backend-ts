import { __controlerStatistics } from '../__controllers/controller.statistics'
import express from 'express'

export const __routesStatistiques = express.Router()
__routesStatistiques.get("/stat/dashboard", __controlerStatistics.dashboard)