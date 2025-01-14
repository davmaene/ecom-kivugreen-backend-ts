import { randomLongNumber } from './../__helpers/helper.random';
import { Hasproducts } from "../__models/model.hasproducts";
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { NextFunction, Request, Response } from "express";
import { Op } from "sequelize";
import { Produits } from "../__models/model.produits";
import { log } from "console";
import { Unites } from "../__models/model.unitemesures";
import { Stocks } from "../__models/model.stocks";
import { Cooperatives } from "../__models/model.cooperatives";
import { Commandes } from '../__models/model.commandes';
import { Services } from '../__services/serives.all';
import { Categories } from '../__models/model.categories';

export const __controllerMarketplace = {
    placecommand: async (req: Request, res: Response, next: NextFunction) => {
        try {
            await Services.placecommande({ req, res, next, id_transaction: null })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    replacecommande: async (req: Request, res: Response, next: NextFunction) => {
        const { id_transaction } = req.body as any;
        const { currentuser } = req as any;
        const { __id, roles, uuid } = currentuser;
        if (!id_transaction || !__id) return Responder(res, HttpStatusCode.NotAcceptable, "this request must have at least id_transaction ")
        try {
            const cmmds = await Commandes.findAll({
                raw: true,
                where: {
                    transaction: id_transaction,
                    createdby: __id,
                    state: 0
                }
            })
            if (cmmds.length > 0) {
                const { type_livraison, payament_phone, currency: currency_payement, shipped_to, id_produit, qte, id_cooperative } = cmmds[0]
                const items: any[] = []
                for (let i = 0; i < cmmds.length; i++) {
                    const { id_produit: as_id_produit, qte: as_qte, id_cooperative } = cmmds[i] as any
                    const has_product = await Hasproducts.findOne({
                        raw: true,
                        where: {
                            TblEcomCooperativeId: id_cooperative,
                            TblEcomProduitId: as_id_produit
                        }
                    })
                    const { id: as_id_product_from } = has_product as any
                    items.push({
                        "id_produit": as_id_product_from,
                        "qte": as_qte
                    })
                }
                req.body = { type_livraison, payament_phone, currency_payement, shipped_to, retry: true, items, }
                log(req.body)
                await Services.placecommande({ req, res, next, id_transaction })
            } else {
                log(cmmds)
                return Responder(res, HttpStatusCode.BadRequest, "We can not process cause the list of commandes is empty !")
            }
        } catch (error) {
            log(error)
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    marketplaceoneproductbyid: async (req: Request, res: Response, next: NextFunction) => {
        const { idproduit } = req.params

        try {

            Hasproducts.belongsTo(Produits) // , { foreignKey: 'TblEcomProduitId' }
            Hasproducts.belongsTo(Unites) // , { foreignKey: 'TblEcomUnitesmesureId' }
            Hasproducts.belongsTo(Stocks) // , { foreignKey: 'TblEcomStockId' }
            Hasproducts.belongsTo(Cooperatives) // , { foreignKey: 'TblEcomCooperativeId' }
            Hasproducts.belongsTo(Categories)

            log("Product is ===> ", typeof idproduit)

            Hasproducts.findAll({
                include: [
                    {
                        model: Produits,
                        required: true,
                        attributes: ['id', 'produit', 'image', 'description', 'id_category']
                    },
                    {
                        model: Categories,
                        required: false,
                    },
                    {
                        model: Unites,
                        required: true,
                        attributes: ['id', 'unity', 'equival_kgs']
                    },
                    {
                        model: Stocks,
                        required: true,
                        attributes: ['id', 'transaction']
                    },
                    {
                        model: Cooperatives,
                        required: true,
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'cooperative', 'sigle']
                    }
                ],
                where: {
                    id: parseInt(idproduit)
                    // qte: { [Op.gte]: 0 }
                }
            })
                .then(async (rows) => {
                    const __ = []
                    for (let index = 0; index < rows.length; index++) {
                        const { __tbl_ecom_produit, __tbl_ecom_category } = rows[index] as any;
                        if (__tbl_ecom_category !== null) __.push((rows[index]).toJSON())
                        else {
                            const { id_category } = __tbl_ecom_produit;
                            const cat = await Categories.findOne({
                                // raw: true,
                                where: {
                                    id: id_category
                                }
                            })
                            __.push({
                                ...(rows[index]).toJSON(),
                                __tbl_ecom_category: cat?.toJSON()
                            })
                        }
                    }
                    return Responder(res, HttpStatusCode.Ok, __[0])
                })
                .catch(err => {
                    log(err)
                    return Responder(res, HttpStatusCode.Conflict, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    marketplace: async (req: Request, res: Response) => {
        let { page_size, page_number } = req.query as any;
        page_number = page_number ? parseInt(page_number) : 0
        page_size = page_size ? parseInt(page_size) : 100

        try {

            Hasproducts.belongsTo(Produits) // , { foreignKey: 'TblEcomProduitId' }
            Hasproducts.belongsTo(Unites) // , { foreignKey: 'TblEcomUnitesmesureId' }
            Hasproducts.belongsTo(Stocks) // , { foreignKey: 'TblEcomStockId' }
            Hasproducts.belongsTo(Cooperatives) // , { foreignKey: 'TblEcomCooperativeId' }
            Hasproducts.belongsTo(Categories)


            const offset = ((page_number) - 1) * (page_size);

            Hasproducts.findAll({
                // attributes: ['id', 'qte', 'currency'],
                offset: (offset),
                limit: (page_size),
                include: [
                    {
                        model: Produits,
                        required: true,
                        attributes: ['id', 'produit', 'image', 'description', 'id_category']
                    },
                    {
                        model: Categories,
                        required: false,
                    },
                    {
                        model: Unites,
                        required: true,
                        attributes: ['id', 'unity', 'equival_kgs']
                    },
                    {
                        model: Stocks,
                        required: true,
                        attributes: ['id', 'transaction']
                    },
                    {
                        model: Cooperatives,
                        required: true,
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'cooperative', 'sigle']
                    }
                ],
                where: {
                    qte: { [Op.gte]: 0 }
                }
            })
                .then(async (rows) => {
                    const __ = []
                    for (let index = 0; index < rows.length; index++) {
                        const { __tbl_ecom_produit, __tbl_ecom_category } = rows[index] as any;
                        if (__tbl_ecom_category !== null) __.push((rows[index]).toJSON())
                        else {
                            const { id_category } = __tbl_ecom_produit;
                            const cat = await Categories.findOne({
                                // raw: true,
                                where: {
                                    id: id_category
                                }
                            })
                            __.push({
                                ...(rows[index]).toJSON(),
                                __tbl_ecom_category: cat?.toJSON()
                            })
                        }
                    }
                    return Responder(res, HttpStatusCode.Ok, { count: rows.length, rows: __ })
                })
                .catch(err => {
                    log(err)
                    return Responder(res, HttpStatusCode.Conflict, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    addtopanier: async (req: Request, res: Response) => {
        try {

        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    deletepanier: async (req: Request, res: Response) => {
        const { idpanier } = req.body
        if (!idpanier) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least idpanier !")
        try {

        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    validatepanier: async (req: Request, res: Response) => {
        const { idpanier } = req.body
        if (!idpanier) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least idpanier !")
        try {

        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    searchbykeyword: async (req: Request, res: Response) => {
        const { keyword } = req.params
        const page_number = 1;
        const page_size = 1000;

        try {
            Hasproducts.belongsTo(Produits) // , { foreignKey: 'TblEcomProduitId' }
            Hasproducts.belongsTo(Unites) // , { foreignKey: 'TblEcomUnitesmesureId' }
            Hasproducts.belongsTo(Stocks) // , { foreignKey: 'TblEcomStockId' }
            Hasproducts.belongsTo(Cooperatives) // , { foreignKey: 'TblEcomCooperativeId' }
            Hasproducts.belongsTo(Categories)

            const offset = ((page_number) - 1) * (page_size);

            Hasproducts.findAll({
                // attributes: ['id', 'qte', 'currency'],
                offset: (offset),
                limit: (page_size),
                include: [
                    {
                        model: Produits,
                        required: true,
                        attributes: ['id', 'produit', 'image', 'description', 'id_category'],
                        where: {
                            produit: {
                                [Op.like]: `%${keyword}%`
                            }
                        }
                    },
                    {
                        model: Categories,
                        required: false,
                    },
                    {
                        model: Unites,
                        required: true,
                        attributes: ['id', 'unity', 'equival_kgs']
                    },
                    {
                        model: Stocks,
                        required: true,
                        attributes: ['id', 'transaction']
                    },
                    {
                        model: Cooperatives,
                        required: true,
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'cooperative', 'sigle']
                    }
                ],
                where: {
                    qte: { [Op.gte]: 0 }
                }
            })
                .then(async (rows) => {
                    const __ = []
                    for (let index = 0; index < rows.length; index++) {
                        const { __tbl_ecom_produit, __tbl_ecom_category } = rows[index] as any;
                        if (__tbl_ecom_category !== null) __.push((rows[index]).toJSON())
                        else {
                            const { id_category } = __tbl_ecom_produit;
                            const cat = await Categories.findOne({
                                // raw: true,
                                where: {
                                    id: id_category
                                }
                            })
                            __.push({
                                ...(rows[index]).toJSON(),
                                __tbl_ecom_category: cat?.toJSON()
                            })
                        }
                    }
                    return Responder(res, HttpStatusCode.Ok, { count: rows.length, rows: __ })
                })
                .catch(err => {
                    log(err)
                    return Responder(res, HttpStatusCode.Conflict, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    searchbycooperative: async (req: Request, res: Response) => {
        const { keyword } = req.params
        const page_number = 1;
        const page_size = 1000;

        try {
            Hasproducts.belongsTo(Produits) // , { foreignKey: 'TblEcomProduitId' }
            Hasproducts.belongsTo(Unites) // , { foreignKey: 'TblEcomUnitesmesureId' }
            Hasproducts.belongsTo(Stocks) // , { foreignKey: 'TblEcomStockId' }
            Hasproducts.belongsTo(Cooperatives) // , { foreignKey: 'TblEcomCooperativeId' }
            Hasproducts.belongsTo(Categories)

            const offset = ((page_number) - 1) * (page_size);

            Hasproducts.findAll({
                // attributes: ['id', 'qte', 'currency'],
                offset: (offset),
                limit: (page_size),
                include: [
                    {
                        model: Produits,
                        required: true,
                        attributes: ['id', 'produit', 'image', 'description', 'id_category']
                    },
                    {
                        model: Categories,
                        required: false,
                    },
                    {
                        model: Unites,
                        required: true,
                        attributes: ['id', 'unity', 'equival_kgs']
                    },
                    {
                        model: Stocks,
                        required: true,
                        attributes: ['id', 'transaction']
                    },
                    {
                        model: Cooperatives,
                        required: true,
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'cooperative', 'sigle'],
                        where: {
                            id: parseInt(keyword)
                        }
                    }
                ],
                where: {
                    qte: { [Op.gte]: 0 }
                }
            })
                .then(async (rows) => {
                    const __ = []
                    for (let index = 0; index < rows.length; index++) {
                        const { __tbl_ecom_produit, __tbl_ecom_category } = rows[index] as any;
                        if (__tbl_ecom_category !== null) __.push((rows[index]).toJSON())
                        else {
                            const { id_category } = __tbl_ecom_produit;
                            const cat = await Categories.findOne({
                                // raw: true,
                                where: {
                                    id: id_category
                                }
                            })
                            __.push({
                                ...(rows[index]).toJSON(),
                                __tbl_ecom_category: cat?.toJSON()
                            })
                        }
                    }
                    return Responder(res, HttpStatusCode.Ok, { count: rows.length, rows: __ })
                })
                .catch(err => {
                    log(err)
                    return Responder(res, HttpStatusCode.Conflict, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    searchbyprovince: async (req: Request, res: Response) => {
        const { keyword } = req.params
        const page_number = 1;
        const page_size = 1000;

        try {
            Hasproducts.belongsTo(Produits) // , { foreignKey: 'TblEcomProduitId' }
            Hasproducts.belongsTo(Unites) // , { foreignKey: 'TblEcomUnitesmesureId' }
            Hasproducts.belongsTo(Stocks) // , { foreignKey: 'TblEcomStockId' }
            Hasproducts.belongsTo(Cooperatives) // , { foreignKey: 'TblEcomCooperativeId' }
            Hasproducts.belongsTo(Categories)

            const offset = ((page_number) - 1) * (page_size);

            Hasproducts.findAll({
                // attributes: ['id', 'qte', 'currency'],
                offset: (offset),
                limit: (page_size),
                include: [
                    {
                        model: Produits,
                        required: true,
                        attributes: ['id', 'produit', 'image', 'description', 'id_category'],
                    },
                    {
                        model: Categories,
                        required: false,
                    },
                    {
                        model: Unites,
                        required: true,
                        attributes: ['id', 'unity', 'equival_kgs']
                    },
                    {
                        model: Stocks,
                        required: true,
                        attributes: ['id', 'transaction']
                    },
                    {
                        model: Cooperatives,
                        required: true,
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'cooperative', 'sigle', 'id_province'],
                        where: {
                            id_province: parseInt(keyword)
                        }
                    }
                ],
                where: {
                    qte: { [Op.gte]: 0 }
                }
            })
                .then(async (rows) => {
                    const __ = []
                    for (let index = 0; index < rows.length; index++) {
                        const { __tbl_ecom_produit, __tbl_ecom_category } = rows[index] as any;
                        if (__tbl_ecom_category !== null) __.push((rows[index]).toJSON())
                        else {
                            const { id_category } = __tbl_ecom_produit;
                            const cat = await Categories.findOne({
                                // raw: true,
                                where: {
                                    id: id_category
                                }
                            })
                            __.push({
                                ...(rows[index]).toJSON(),
                                __tbl_ecom_category: cat?.toJSON()
                            })
                        }
                    }
                    return Responder(res, HttpStatusCode.Ok, { count: rows.length, rows: __ })
                })
                .catch(err => {
                    log(err)
                    return Responder(res, HttpStatusCode.Conflict, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    searchbycategory: async (req: Request, res: Response) => {
        const { keyword } = req.params
        const page_number = 1;
        const page_size = 1000;

        try {
            Hasproducts.belongsTo(Produits) // , { foreignKey: 'TblEcomProduitId' }
            Hasproducts.belongsTo(Unites) // , { foreignKey: 'TblEcomUnitesmesureId' }
            Hasproducts.belongsTo(Stocks) // , { foreignKey: 'TblEcomStockId' }
            Hasproducts.belongsTo(Cooperatives) // , { foreignKey: 'TblEcomCooperativeId' }
            Hasproducts.belongsTo(Categories)

            const offset = ((page_number) - 1) * (page_size);

            Hasproducts.findAll({
                // attributes: ['id', 'qte', 'currency'],
                offset: (offset),
                limit: (page_size),
                include: [
                    {
                        model: Produits,
                        required: true,
                        attributes: ['id', 'produit', 'image', 'description', 'id_category'],
                        where: {
                            id_category: parseInt(keyword)
                        }
                    },
                    {
                        model: Categories,
                        required: false,
                    },
                    {
                        model: Unites,
                        required: true,
                        attributes: ['id', 'unity', 'equival_kgs']
                    },
                    {
                        model: Stocks,
                        required: true,
                        attributes: ['id', 'transaction']
                    },
                    {
                        model: Cooperatives,
                        required: true,
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'cooperative', 'sigle', 'id_province'],
                    }
                ],
                where: {
                    qte: { [Op.gte]: 0 }
                }
            })
                .then(async (rows) => {
                    const __ = []
                    for (let index = 0; index < rows.length; index++) {
                        const { __tbl_ecom_produit, __tbl_ecom_category } = rows[index] as any;
                        if (__tbl_ecom_category !== null) __.push((rows[index]).toJSON())
                        else {
                            const { id_category } = __tbl_ecom_produit;
                            const cat = await Categories.findOne({
                                // raw: true,
                                where: {
                                    id: id_category
                                }
                            })
                            __.push({
                                ...(rows[index]).toJSON(),
                                __tbl_ecom_category: cat?.toJSON()
                            })
                        }
                    }
                    return Responder(res, HttpStatusCode.Ok, { count: rows.length, rows: __ })
                })
                .catch(err => {
                    log(err)
                    return Responder(res, HttpStatusCode.Conflict, err)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}