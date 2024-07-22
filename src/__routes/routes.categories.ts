import { __controllerCategories } from '../__controllers/controller.categories'
import express from 'express'

export const __routesCategories = express.Router()

__routesCategories.get('/list', __controllerCategories.list)
__routesCategories.post('/categorie/add', __controllerCategories.add)
__routesCategories.put('/categorie/:id', __controllerCategories.update)
__routesCategories.delete('/categorie/:id', __controllerCategories.delete)