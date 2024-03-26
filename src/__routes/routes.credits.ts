import { creditModelValidator, onValidate } from "../__middlewares/middleware.datavalidator"
import { __controllersCredits } from "../__controllers/controller.credits"
import express from "express"

export const __routesCredits = express.Router()

__routesCredits.get("/list", __controllersCredits.list)
__routesCredits.post("/credit/add", onValidate(creditModelValidator),__controllersCredits.add)
__routesCredits.get("/credit/bystatus/:status",__controllersCredits.listbystatus)
__routesCredits.put("/credit/:idcredit",__controllersCredits.listbystatus)
__routesCredits.delete("/credit/:idcredit",__controllersCredits.listbystatus)