import { onValidate, userModelOnSignin, userModelValidator } from '../__middlewares/middleware.datavalidator'
import { __controllerUsers } from '../__controllers/controller.users'
import express from 'express'

export const __routesUsers = express.Router()

__routesUsers.post("/user/auth", onValidate(userModelOnSignin), __controllerUsers.auth)
__routesUsers.post("/user/register", onValidate(userModelValidator),__controllerUsers.register)
