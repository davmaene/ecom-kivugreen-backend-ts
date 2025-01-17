import { __controlerStatistics } from '../__controllers/controller.statistics'
import express from 'express'

export const __routesStatistiques = express.Router()
__routesStatistiques.get("/stat/dashboard", __controlerStatistics.dashboard)
__routesStatistiques.get("/ventes/bycooperative/:idcooperative", __controlerStatistics.historiquevalidatedcommandes)
__routesStatistiques.get("/ventes/bymember/:id_member", __controlerStatistics.historiquevalidatedcommandesformember)
__routesStatistiques.get("/approvionnements/bymember/:id_member", __controlerStatistics.historiqueapprovisonnementmember)