import { __controllerCooperatives } from '../__controllers/controller.cooperatives';
import { coopecModelValidator, onValidate, userModelOnSignin, userModelValidator } from '../__middlewares/middleware.datavalidator'

import express from 'express';

export const __routesCooperatives = express.Router()

__routesCooperatives.get("/list", __controllerCooperatives.list)
__routesCooperatives.post("/cooperative/add", onValidate(coopecModelValidator), __controllerCooperatives.add)
__routesCooperatives.put("/cooperative/addmembers", __controllerCooperatives.addmemebers)
__routesCooperatives.put("/cooperative/:idcooperative", __controllerCooperatives.update)
__routesCooperatives.delete("/cooperative/:idcooperative", __controllerCooperatives.delete)