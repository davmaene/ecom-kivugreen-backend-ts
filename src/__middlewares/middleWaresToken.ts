import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from '../__enums/enum.httpsstatuscode';
import { IClient } from '../types';
import * as dotenv from 'dotenv';
// import { ILogin } from '../types';
dotenv.config();

export interface CustomerRequest extends Request { user: any | JwtPayload }

export const SECRET_KEY: Secret = process.env.JWT as Secret;

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    const autoHead = req.headers.authorization;
    if (autoHead) {
        const token = autoHead.split(" ")[1];
        jwt.verify(token, SECRET_KEY, async (error, user: any) => {
            if (error) {
                res.status(HttpStatusCode.Unauthorized).json({
                    data: [],
                    msg: `Token is not valid`,
                    token: "NO"
                });
                return;
            }
            (req as CustomerRequest).user = user;
            next();
        });
    } else {
        
        res.status(HttpStatusCode.Forbidden).send({
            msg: `Token manquant`,
            data: [],
            token: "NO"
        });
        return 
    }
}

export const initGene = async (auth: any) => {
    const token = jwt.sign({ auth }, SECRET_KEY, {
        expiresIn: process.env.EXPRES_IN,
    });
    return token;
}
