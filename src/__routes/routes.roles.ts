import { log } from 'console'
import { __controllerRoles } from '../__controllers/controller.roles'
import express from 'express'

export const __routesRoles = express.Router()
__routesRoles.get('/list', __controllerRoles.list)
__routesRoles.post('/role/add', __controllerRoles.add)
__routesRoles.put('/role/addtouser', __controllerRoles.addtouser)