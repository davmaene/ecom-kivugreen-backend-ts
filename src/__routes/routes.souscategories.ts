import { __controllerSouscategories } from '../__controllers/controller.souscategories'
import express from 'express'

export const __routesSouscategories = express.Router()

__routesSouscategories.get('/list', __controllerSouscategories.list)
__routesSouscategories.post('/souscategorie/add', __controllerSouscategories.add)
__routesSouscategories.put('/souscategorie/:id', __controllerSouscategories.update)
__routesSouscategories.delete('/souscategorie/:id', __controllerSouscategories.delete)