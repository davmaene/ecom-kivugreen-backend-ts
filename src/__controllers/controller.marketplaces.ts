import { NextFunction, Request, Response } from "express";

export const __controllerMarketplace = {
    marketplace: async (req: Request, res: Response, next: NextFunction) => {
        const { limit: aslength, offset: aspage } = req.query;
    }
}