import expres, { NextFunction, Request, Response } from 'express';
import { __controlerAssets } from '../__controllers/controller.assets';
import { log } from 'console';

export const __routesAssets = expres.Router()

__routesAssets.get("/as_avatar/:ressources", __controlerAssets.getressoursesavatar)
__routesAssets.get("/as_assets/:ressources", __controlerAssets.getanyressourses)