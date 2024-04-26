import { __controllerMembers } from '../__controllers/controller.members'
import express from 'express'

export const __routesMembers = express.Router()

__routesMembers.get("/list", __controllerMembers.list)
__routesMembers.get("/list/bycooperative/:idcooperative", __controllerMembers.listbycooperative)
__routesMembers.get("/list/byothercooperatives/:idcooperative", __controllerMembers.listbyothercooperative)