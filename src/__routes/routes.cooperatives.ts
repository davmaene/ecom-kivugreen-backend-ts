import { __controllerCooperatives } from '../__controllers/controller.cooperatives';
import express from 'express';

export const __routesCooperatives = express.Router()
__routesCooperatives.get("/list", __controllerCooperatives.list)