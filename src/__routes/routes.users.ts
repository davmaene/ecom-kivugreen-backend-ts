import { __controllerUsers } from '../__controllers/controller.users'
import express from 'express'

export const __routesUsers = express.Router()

__routesUsers.post("/user/auth",  __controllerUsers.auth)
__routesUsers.post("/user/register",  __controllerUsers.register)

// __routesUsers.post("/user/add",  __controlerUsers.savenew) // onValidate(userModelValidator)
// __routesUsers.post("/user/verify", onValidate(userModelOnVerification), limiterVerify, __controlerUsers.verify)
// __routesUsers.get("/user/verify", limiterVerify, __controlerUsers.verifyemail)
// __routesUsers.post("/user/resendcode", onValidate(userModelOnResendCode), limiterResend, __controlerUsers.resendcode)
// __routesUsers.put("/user/refreshtoken", limiterResend, __controlerUsers.refreshtoken)
// __routesUsers.put("/user/:id", limiterSignup, __controlerUsers.update)
// __routesUsers.delete("/user/:id", __controlerUsers.delete)
// __routesUsers.get("/user/:id", __controlerUsers.usergetbyid)
// __routesUsers.get("/list", __controlerUsers.list)
// __routesUsers.get("/list/byrole/:idrole", __controlerUsers.listbyrole)