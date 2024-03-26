import { bankModelValidator, onValidate } from '../__middlewares/middleware.datavalidator';
import { __controllerBanks } from '../__controllers/controller.banks'
import express from 'express'

export const __routesBanks = express.Router();

__routesBanks.get("/list", __controllerBanks.list)
__routesBanks.post("/bank/add", onValidate(bankModelValidator), __controllerBanks.add)