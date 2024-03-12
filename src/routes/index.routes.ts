import { Router } from "express";
import actionRoutes from './action/index.routes'

const router = Router();

actionRoutes(router)

export default router;
