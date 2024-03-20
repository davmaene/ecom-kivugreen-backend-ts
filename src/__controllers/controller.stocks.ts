import { randomLongNumber } from './../__helpers/helper.random';
import { Stocks } from "__models/model.stocks";
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { Response, Request } from "express";
import { Produits } from '__models/model.produits';
import { log } from 'console';

export const __controllerStocks = {
    in: async (req: Request, res: Response) => {
        const { id_ccoperative, items } = req.body;
        const { currentuser } = req as any;
        if (!id_ccoperative || !items) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least !id_ccoperative || !items")
        if (!Array.isArray(items) || Array.from(items).length === 0) return Responder(res, HttpStatusCode.NotAcceptable, "Items must be a type of Array")
        const array: any[] = Array.from(items);
        const { __id, roles, uuid, phone } = currentuser

        try {
            const treated: any[] = []
            for (let index = 0; index < array.length; index++) {
                const { id_produit, qte }: any = array[index];
                try {
                    const prd = await Produits.findOne({
                        attributes: ['id', 'produit', 'id_unity', 'id_category', 'id_souscategory', 'image'],
                        where: {
                            id: id_produit
                        }
                    })
                    if (prd instanceof Produits) {
                        const { id, produit, id_unity, id_category, id_souscategory, image } = prd.toJSON() as any
                    }
                } catch (error) {
                    log("Error on treatement on object => ", id_produit)
                }
            }
            Stocks.create({
                items: treated,
                createdby: __id,
                id_cooperative: id_ccoperative,
                transaction: randomLongNumber({ length: 15 })
            })
                .then(stock => {
                    if (stock instanceof Stocks) Responder(res, HttpStatusCode.Ok, stock)
                    else return Responder(res, HttpStatusCode.Conflict, {})
                })
                .catch(err => Responder(res, HttpStatusCode.Conflict, err))
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    list: (req: Request, res: Response) => {

    }
}