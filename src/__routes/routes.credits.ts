import { creditModelValidator, onValidate } from "../__middlewares/middleware.datavalidator"
import { __controllersCredits } from "../__controllers/controller.credits"
import express from "express"

export const __routesCredits = express.Router()

__routesCredits.get("/list", __controllersCredits.list)
__routesCredits.post("/credit/add", onValidate(creditModelValidator),__controllersCredits.add)
__routesCredits.put("/credit/validate/:id_credit",__controllersCredits.validate)
__routesCredits.get("/bystatus/:status",__controllersCredits.listbystatus)
__routesCredits.get("/bymember/:id_member/:status",__controllersCredits.listbyuserandbystatus)
__routesCredits.get("/bymember/:id_cooperative",__controllersCredits.listbyuser)
__routesCredits.get("/bycooperative/:id_cooperative/:status",__controllersCredits.listbycooperativeandbystatus)
__routesCredits.get("/bycooperative/:id_cooperative",__controllersCredits.listbycooperative)
__routesCredits.put("/credit/:idcredit",__controllersCredits.update)
__routesCredits.delete("/credit/:idcredit",__controllersCredits.delete)