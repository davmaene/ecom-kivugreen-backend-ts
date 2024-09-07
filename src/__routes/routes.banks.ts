import { bankModelValidator, onValidate, userModelOnSignin } from '../__middlewares/middleware.datavalidator';
import { __controllerBanks } from '../__controllers/controller.banks'
import express from 'express'

export const __routesBanks = express.Router();

__routesBanks.get("/list", __controllerBanks.list)
__routesBanks.post("/bank/add", onValidate(bankModelValidator), __controllerBanks.add)
__routesBanks.put("/bank/:idbank", __controllerBanks.update)
__routesBanks.delete("/bank/:idbank", __controllerBanks.delete)