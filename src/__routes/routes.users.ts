import { onValidate, userModelOnSignin, userModelValidator } from '../__middlewares/middleware.datavalidator'
import { __controllerUsers } from '../__controllers/controller.users'
import express from 'express'

export const __routesUsers = express.Router()

__routesUsers.put("/user/resetpassword", __controllerUsers.resetpassword)
__routesUsers.post("/user/auth", onValidate(userModelOnSignin), __controllerUsers.auth)
__routesUsers.post("/user/signin", onValidate(userModelOnSignin), __controllerUsers.signin)
__routesUsers.post("/user/signup", __controllerUsers.signup)
__routesUsers.post("/user/register", onValidate(userModelValidator), __controllerUsers.register)
__routesUsers.post("/user/add", onValidate(userModelValidator), __controllerUsers.register)
__routesUsers.put("/user/validate/:iduser", __controllerUsers.validate)
__routesUsers.put("/user/verify", __controllerUsers.verify)
__routesUsers.put("/user/resendcode", __controllerUsers.resendcode)
__routesUsers.get("/list", __controllerUsers.list)
__routesUsers.get("/list/byrole/:idrole", __controllerUsers.listbyrole)
__routesUsers.get("/user/:iduser", __controllerUsers.profile)
__routesUsers.put("/user/:iduser", __controllerUsers.update)
__routesUsers.delete("/user/:iduser", __controllerUsers.delete)
