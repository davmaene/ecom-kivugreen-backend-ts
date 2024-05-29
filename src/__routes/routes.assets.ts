import expres, { NextFunction, Request, Response } from 'express';
import { __controlerAssets } from '../__controllers/controller.assets';

export const __routesAssets = expres.Router()

__routesAssets.get("/as_avatar/:ressources", __controlerAssets.getressoursesavatar)
__routesAssets.get("/as_assets/:ressources", __controlerAssets.getanyressourses)
__routesAssets.get("/as_docs/:ressources", __controlerAssets.getanydocs)