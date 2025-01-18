import { randomLongNumber } from './../__helpers/helper.random';
import { Stocks } from "../__models/model.stocks";
import { HttpStatusCode } from "../__enums/enum.httpsstatuscode";
import { Responder } from "../__helpers/helper.responseserver";
import { Response, Request, NextFunction } from "express";
import { Produits } from '../__models/model.produits';
import { Console, log } from 'console';
import { Cooperatives } from '../__models/model.cooperatives';
import { Hasproducts } from '../__models/model.hasproducts';
import { connect } from '../__databases/connecte';
import { Configs } from '../__models/model.configs';
import { Categories } from '../__models/model.categories';
import { Unites } from '../__models/model.unitemesures';
import { Commandes } from '../__models/model.commandes';
import { Typelivraisons } from '../__models/model.typelivraison';
import { calcPriceAsSomme, getProductDetailsAsRegister, renderAsLisibleNumber, supprimerDoublons } from '../__helpers/helper.all';
import { Historiquesmembersstocks } from '../__models/model.histories';
import { Users } from '../__models/model.users';
import { Services } from '../__services/serives.all';

export const __controllerStocks = {
    historiqueapprovisionnementpartransaction: async (req: Request, res: Response, next: NextFunction) => {
        const { id_stock } = req.params as any
        if (!id_stock) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least id_cooperative")
        const { currentuser } = req as any;
        const { __id, roles, uuid, phone } = currentuser;
        try {

            Historiquesmembersstocks.belongsTo(Cooperatives)
            Historiquesmembersstocks.belongsTo(Users)
            Historiquesmembersstocks.belongsTo(Produits)
            Historiquesmembersstocks.belongsTo(Categories)
            Historiquesmembersstocks.belongsTo(Unites)

            Historiquesmembersstocks.findAndCountAll({
                order: [
                    ['id', 'DESC']
                ],
                where: {
                    TblEcomStockId: id_stock
                },
                include: [
                    {
                        model: Cooperatives,
                        required: true,
                        attributes: ['id', 'adresse', 'phone', 'num_enregistrement', 'cooperative']
                    },
                    {
                        model: Users,
                        required: true,
                        attributes: ['id', 'nom', 'postnom', 'prenom', 'phone', 'email']
                    },
                    {
                        model: Produits,
                        required: true,
                        attributes: ['id', 'produit']
                    },
                    {
                        model: Categories,
                        required: true,
                        attributes: ['id', 'category']
                    },
                    {
                        model: Unites,
                        required: true,
                        attributes: ['id', 'unity', 'equival_kgs']
                    },
                    // {
                    //     model: Stocks,
                    //     required: true
                    // }
                ]
            })
                .then(({ rows, count }) => {
                    return Responder(res, HttpStatusCode.Ok, { count, rows })
                })
                .catch(err => {
                    log(err)
                    return Responder(res, HttpStatusCode.InternalServerError, err)
                })
        } catch (error) {
            log(error)
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    historiqueapprovisionnement: async (req: Request, res: Response, next: NextFunction) => {
        const { id_cooperative } = req.params as any
        if (!id_cooperative) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least id_cooperative")
        const { currentuser } = req as any;
        const { __id, roles, uuid, phone } = currentuser;
        try {

            Historiquesmembersstocks.belongsTo(Cooperatives)
            Historiquesmembersstocks.belongsTo(Users)
            Historiquesmembersstocks.belongsTo(Produits)
            Historiquesmembersstocks.belongsTo(Categories)
            Historiquesmembersstocks.belongsTo(Unites)

            Historiquesmembersstocks.findAndCountAll({
                order: [
                    ['id', 'DESC']
                ],
                where: {
                    TblEcomCooperativeId: id_cooperative
                },
                include: [
                    {
                        model: Cooperatives,
                        required: true,
                        attributes: ['id', 'adresse', 'phone', 'num_enregistrement', 'cooperative']
                    },
                    {
                        model: Users,
                        required: true,
                        attributes: ['id', 'nom', 'postnom', 'prenom', 'phone', 'email']
                    },
                    {
                        model: Produits,
                        required: true,
                        attributes: ['id', 'produit']
                    },
                    {
                        model: Categories,
                        required: true,
                        attributes: ['id', 'category']
                    },
                    {
                        model: Unites,
                        required: true,
                        attributes: ['id', 'unity', 'equival_kgs']
                    },
                    // {
                    //     model: Stocks,
                    //     required: true
                    // }
                ]
            })
                .then(({ rows, count }) => {
                    return Responder(res, HttpStatusCode.Ok, { count, rows })
                })
                .catch(err => {
                    log(err)
                    return Responder(res, HttpStatusCode.InternalServerError, err)
                })
        } catch (error) {
            log(error)
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    historiqueapprovisionnementmembrecooperative: async (req: Request, res: Response, next: NextFunction) => {
        const { id_membre } = req.params as any
        if (!id_membre) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least id_cooperative")
        const { currentuser } = req as any;
        const { __id, roles, uuid, phone } = currentuser;
        try {

            Historiquesmembersstocks.belongsTo(Cooperatives)
            Historiquesmembersstocks.belongsTo(Users)
            Historiquesmembersstocks.belongsTo(Produits)
            Historiquesmembersstocks.belongsTo(Categories)
            Historiquesmembersstocks.belongsTo(Unites)

            Historiquesmembersstocks.findAndCountAll({
                order: [
                    ['id', 'DESC']
                ],
                where: {
                    // TblEcomCooperativeId: id_membre
                },
                include: [
                    {
                        model: Cooperatives,
                        required: true,
                        attributes: ['id', 'adresse', 'phone', 'num_enregistrement', 'cooperative']
                    },
                    {
                        model: Users,
                        required: true,
                        attributes: ['id', 'nom', 'postnom', 'prenom', 'phone', 'email'],
                        where: {
                            id: id_membre
                        }
                    },
                    {
                        model: Produits,
                        required: true,
                        attributes: ['id', 'produit']
                    },
                    {
                        model: Categories,
                        required: true,
                        attributes: ['id', 'category']
                    },
                    {
                        model: Unites,
                        required: true,
                        attributes: ['id', 'unity', 'equival_kgs']
                    },
                    // {
                    //     model: Stocks,
                    //     required: true
                    // }
                ]
            })
                .then(({ rows, count }) => {
                    return Responder(res, HttpStatusCode.Ok, { count, rows })
                })
                .catch(err => {
                    log(err)
                    return Responder(res, HttpStatusCode.InternalServerError, err)
                })
        } catch (error) {
            log(error)
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    history: async (req: Request, res: Response, next: NextFunction) => {
        const { currentuser } = req as any;
        const { __id, roles, uuid, phone } = currentuser;
        const { idstock } = req.params;
        if (!idstock) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least stockid")
        try {
            Stocks.belongsTo(Cooperatives, { foreignKey: "id_cooperative" })
            Stocks.belongsToMany(Produits, { through: Hasproducts, })// as: 'produits'

            Stocks.findOne({
                where: {
                    id: idstock
                },
                include: [
                    {
                        model: Produits,
                        // as: 'produits',
                        required: true,
                        attributes: ['id', 'produit']
                    },
                    {
                        model: Cooperatives,
                        required: true,
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'email', 'sigle', 'cooperative', 'description']
                    }
                ]
            })
                .then(async stck => {
                    if (stck instanceof Stocks) {
                        const __mouvements: any[] = []
                        const { __tbl_ecom_cooperative, __tbl_ecom_produits, date_expiration, date_production, createdby, description, id_cooperative, transaction, createdAt, id, updatedAt } = stck.toJSON() as any
                        for (let index = 0; index < __tbl_ecom_produits.length; index++) {
                            const { id: asproduct, __tbl_ecom_hasproducts } = __tbl_ecom_produits[index];
                            const { id: ashasproduct, id_membre, qte, prix_unitaire, prix_plus_commission, currency } = __tbl_ecom_hasproducts
                            // ============================================
                            Commandes.belongsTo(Produits, { foreignKey: "id_produit" })
                            Commandes.belongsTo(Typelivraisons, { foreignKey: "type_livraison" })
                            const cmmds = await Commandes.findAll({
                                include: [
                                    {
                                        model: Produits,
                                        required: false,
                                    },
                                    {
                                        model: Typelivraisons,
                                        required: false,
                                    }
                                ],
                                where: {
                                    id_produit: ashasproduct
                                }
                            })
                            __mouvements.push({
                                ...__tbl_ecom_produits,
                                mouvements: {
                                    ...__tbl_ecom_hasproducts,

                                }
                            })
                        }
                        return Responder(res, HttpStatusCode.Ok, { ...stck.toJSON(), mouvements: __mouvements })
                    } else {
                        log(stck)
                        return Responder(res, HttpStatusCode.InternalServerError, stck)
                    }
                })
                .catch(er => {
                    log(er)
                    return Responder(res, HttpStatusCode.InternalServerError, er)
                })

        } catch (error) {
            log(error)
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    in: async (req: Request, res: Response) => {
        const { id_cooperative, items, description, date_production, date_expiration } = req.body;
        const { currentuser } = req as any;
        const { __id } = currentuser;
        // Vérifications initiales
        if (!id_cooperative || !items) {
            return Responder(res, HttpStatusCode.NotAcceptable, "Request must include 'id_cooperative' and 'items'.");
        }

        if (!Array.isArray(items) || items.length === 0) {
            return Responder(res, HttpStatusCode.NotAcceptable, "Items must be a non-empty array.");
        }

        const id_transaction = randomLongNumber({ length: 15 });

        try {
            // Récupération de la configuration
            const configs = await Configs.findOne({ where: { id: 1 } });
            if (!configs) {
                return Responder(res, HttpStatusCode.Conflict, "Configuration parameters are missing.");
            }

            const { taux_change, commission_price } = configs.toJSON() as any;

            // Début de la transaction
            const transaction = await connect.transaction();

            try {
                // Création du stock
                const stock = await Stocks.create(
                    {
                        date_expiration,
                        date_production,
                        createdby: __id,
                        id_cooperative,
                        transaction: id_transaction,
                        description,
                    },
                    { transaction }
                );

                const treated: any[] = [];
                const notTreated: any[] = [];

                // Traitement des items
                for (const item of items) {
                    const {
                        id_produit,
                        qte,
                        prix_unitaire,
                        currency,
                        date_production: asdate_production,
                        id_member: as_id_member,
                        qte_critique,
                    } = item;

                    if (!id_produit || !qte || !prix_unitaire || !currency || !asdate_production || !as_id_member) {
                        notTreated.push(item);
                        continue;
                    }

                    const id_member = parseInt(as_id_member);

                    try {
                        const prd = await Produits.findOne({
                            attributes: ['id', 'produit', 'id_unity', 'id_category', 'id_souscategory', 'image', 'tva'],
                            where: { id: id_produit },
                        });
                        
                        if (!prd) {
                            notTreated.push(item);
                            log("Item not found ==>", )
                            continue;
                        }

                        const { id: asstockid } = stock.toJSON() as any;
                        const { produit, id_unity, id_category, tva } = prd.toJSON() as any;

                        const unit = await Unites.findOne({
                            attributes: ['id', 'unity'],
                            where: { id: id_unity },
                        });

                        if (!produit || !id_category || !id_unity) {
                            notTreated.push(item);
                            continue;
                        }
                        const {unity} = unit?.toJSON() as any
                        const price = await Services.calcProductPrice({ unit_price: prix_unitaire, tva });
                        const value = price * qte//renderAsLisibleNumber({ nombre: price * qte })
                        // Ajout ou mise à jour du produit
                        const [createdItem, created] = await Hasproducts.findOrCreate({
                            where: {
                                TblEcomProduitId: id_produit,
                                TblEcomCooperativeId: id_cooperative,
                            },
                            defaults: {
                                prix_plus_commission: price,
                                currency,
                                tva,
                                qte_critique: qte_critique || 0,
                                prix_unitaire,
                                date_production: asdate_production,
                                TblEcomCategoryId: id_category,
                                TblEcomCooperativeId: id_cooperative,
                                TblEcomProduitId: id_produit,
                                TblEcomStockId: asstockid || 0,
                                TblEcomUnitesmesureId: id_unity,
                                qte,
                            },
                            transaction,
                        });

                        if (created) {
                            await Historiquesmembersstocks.create(
                                {
                                    TblEcomUserId: id_member,
                                    qte,
                                    date_production: asdate_production,
                                    TblEcomCategoryId: id_category,
                                    TblEcomCooperativeId: id_cooperative,
                                    TblEcomProduitId: id_produit,
                                    TblEcomStockId: asstockid || 0,
                                    TblEcomUnitesmesureId: id_unity,
                                },
                                { transaction }
                            );

                            treated.push({...item, total_price: value, produit, unity });

                        } else {
                            // Mise à jour des quantités
                            const { qte: currentQte } = createdItem.toJSON();
                            await createdItem.update(
                                {
                                    qte: currentQte + qte,
                                },
                                { transaction }
                            );

                            treated.push({...item, total_price: value, produit, unity});
                        }
                    } catch (error) {
                        console.error("Error processing item:", item, error);
                        notTreated.push(item);
                    }
                }

                // Validation de la transaction
                if (treated.length > 0) {
                    await transaction.commit();
                    const prices = calcPriceAsSomme({ array: treated, column: 'total_price' })
                    return Responder(res, HttpStatusCode.Ok, { ...stock.toJSON(), valorisation: prices, produits: treated });
                } else {
                    await transaction.rollback();
                    return Responder(res, HttpStatusCode.Conflict, "No items were successfully processed.");
                }
            } catch (error) {
                await transaction.rollback();
                return Responder(res, HttpStatusCode.Conflict, "No items were successfully processed.");
            }
        } catch (error: any) {
            console.error("Error in middleware:", error);
            return Responder(res, HttpStatusCode.InternalServerError, error.message || "An error occurred.");
        }
    },
    list: async (req: Request, res: Response) => {
        try {
            Stocks.belongsTo(Cooperatives, { foreignKey: "id_cooperative" })
            Stocks.belongsToMany(Produits, { through: Hasproducts, })// as: 'produits'

            Stocks.findAll({
                order: [
                    ['id', 'DESC']
                ],
                where: {},
                include: [
                    {
                        model: Produits,
                        // as: 'produits',
                        required: true,
                        attributes: ['id', 'produit']
                    },
                    {
                        model: Cooperatives,
                        required: true,
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'email', 'sigle', 'cooperative', 'description']
                    }
                ]
            })
                .then(async (rows) => {
                    const __: any[] = []
                    for (let index = 0; index < rows.length; index++) {
                        let items: any[] = []
                        const { __tbl_ecom_produits } = rows[index].toJSON() as any;
                        for (let index = 0; index < __tbl_ecom_produits.length; index++) {
                            const { id, produit, __tbl_ecom_hasproducts } = __tbl_ecom_produits[index] as any;
                            const { TblEcomProduitId, TblEcomCategoryId, TblEcomUnitesmesureId, id_membre } = __tbl_ecom_hasproducts;
                            const member = await Users.findOne({
                                where: {
                                    id: id_membre
                                },
                                attributes: ['id', 'nom', 'postnom', 'prenom', 'phone']
                            })
                            const cat = await Categories.findOne({
                                // raw: true,
                                where: {
                                    id: TblEcomCategoryId
                                }
                            })
                            const uni = await Unites.findOne({
                                // raw: true,
                                where: {
                                    id: TblEcomUnitesmesureId
                                }
                            })
                            items.push({
                                ...__tbl_ecom_produits[index],
                                __tbl_ecom_categories: cat?.toJSON(),
                                __tbl_ecom_unitesmesures: uni?.toJSON(),
                                __tbl_member: member?.toJSON()
                            })
                        }
                        __.push({
                            ...rows[index].toJSON() as any,
                            __tbl_ecom_produits: [...items]
                        })
                    }
                    return Responder(res, HttpStatusCode.Ok, { count: rows.length, rows: __ })
                })
                .catch(error => {
                    return Responder(res, HttpStatusCode.Conflict, error)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    getonebycoopec: async (req: Request, res: Response) => {
        const { idcooperative } = req.params;
        if (!idcooperative) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least idcooperative")
        try {
            Stocks.belongsTo(Cooperatives, { foreignKey: "id_cooperative" })
            Stocks.belongsToMany(Produits, { through: Hasproducts })// as: 'produits'
            Stocks.findAll({
                order: [
                    ['id', 'DESC'],
                ],
                where: {},
                include: [
                    {
                        model: Produits,
                        // as: 'produits',
                        required: true,
                        attributes: ['id', 'produit']
                    },
                    {
                        model: Cooperatives,
                        required: true,
                        where: {
                            id: parseInt(idcooperative)
                        },
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'email', 'sigle', 'cooperative', 'description']
                    }
                ]
            })
                .then(async (rows) => {
                    const __: any[] = []
                    for (let index = 0; index < rows.length; index++) {
                        let items: any[] = []
                        const { __tbl_ecom_produits } = rows[index].toJSON() as any;
                        for (let index = 0; index < __tbl_ecom_produits.length; index++) {
                            const { id, produit, __tbl_ecom_hasproducts } = __tbl_ecom_produits[index] as any;
                            const { TblEcomProduitId, TblEcomCategoryId, TblEcomUnitesmesureId, id_membre } = __tbl_ecom_hasproducts;
                            const member = await Users.findOne({
                                where: {
                                    id: id_membre
                                },
                                attributes: ['id', 'nom', 'postnom', 'prenom', 'phone']
                            })
                            const cat = await Categories.findOne({
                                // raw: true,
                                where: {
                                    id: TblEcomCategoryId
                                }
                            })
                            const uni = await Unites.findOne({
                                // raw: true,
                                where: {
                                    id: TblEcomUnitesmesureId
                                }
                            })
                            items.push({
                                ...__tbl_ecom_produits[index],
                                __tbl_ecom_categories: cat?.toJSON(),
                                __tbl_ecom_unitesmesures: uni?.toJSON(),
                                __tbl_member: member?.toJSON()
                            })
                        }
                        __.push({
                            ...rows[index].toJSON() as any,
                            __tbl_ecom_produits: [...items]
                        })
                    }
                    return Responder(res, HttpStatusCode.Ok, { count: rows.length, rows: __ })
                })
                .catch(error => {
                    log(error)
                    return Responder(res, HttpStatusCode.Conflict, error)
                })
        } catch (error) {
            log(error)
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    getonebyid: async (req: Request, res: Response) => {
        const { idstock } = req.params;
        if (!idstock) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least idstock")
        try {
            Stocks.belongsTo(Cooperatives, { foreignKey: "id_cooperative" })
            Stocks.belongsToMany(Produits, { through: Hasproducts, })// as: 'produits'
            Stocks.findAll({
                where: {
                    id: idstock
                },
                include: [
                    {
                        model: Produits,
                        // as: 'produits',
                        required: true,
                        attributes: ['id', 'produit']
                    },
                    {
                        model: Cooperatives,
                        required: true,
                        // where: {
                        //     id: idcooperative
                        // },
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'email', 'sigle', 'cooperative', 'description']
                    }
                ]
            })
                .then(async (rows) => {
                    const __: any[] = []
                    for (let index = 0; index < rows.length; index++) {
                        let items: any[] = []
                        const { __tbl_ecom_produits } = rows[index].toJSON() as any;
                        for (let index = 0; index < __tbl_ecom_produits.length; index++) {
                            const { id, produit, __tbl_ecom_hasproducts } = __tbl_ecom_produits[index] as any;
                            const { TblEcomProduitId, TblEcomCategoryId, TblEcomUnitesmesureId, id_membre } = __tbl_ecom_hasproducts;
                            const member = await Users.findOne({
                                where: {
                                    id: id_membre
                                },
                                attributes: ['id', 'nom', 'postnom', 'prenom', 'phone']
                            })
                            const cat = await Categories.findOne({
                                // raw: true,
                                where: {
                                    id: TblEcomCategoryId
                                }
                            })
                            const uni = await Unites.findOne({
                                // raw: true,
                                where: {
                                    id: TblEcomUnitesmesureId
                                }
                            })
                            items.push({
                                ...__tbl_ecom_produits[index],
                                __tbl_ecom_categories: cat?.toJSON(),
                                __tbl_ecom_unitesmesures: uni?.toJSON(),
                                __tbl_member: member?.toJSON()
                            })
                        }
                        __.push({
                            ...rows[index].toJSON() as any,
                            __tbl_ecom_produits: [...items]
                        })
                    }
                    return Responder(res, HttpStatusCode.Ok, { count: rows.length, rows: __ })
                })
                .catch(error => {
                    log(error)
                    return Responder(res, HttpStatusCode.Conflict, error)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    getasregister: async (req: Request, res: Response) => {
        const { id_cooperative: idstock } = req.params;
        if (!idstock) return Responder(res, HttpStatusCode.NotAcceptable, "This request must have at least idstock")
        try {
            Stocks.belongsTo(Cooperatives, { foreignKey: "id_cooperative" })
            Stocks.belongsToMany(Produits, { through: Hasproducts, })// as: 'produits'
            Stocks.findAll({
                where: {
                    id_cooperative: idstock
                },
                include: [
                    {
                        model: Produits,
                        // as: 'produits',
                        required: true,
                        attributes: ['id', 'produit']
                    },
                    {
                        model: Cooperatives,
                        required: true,
                        where: {
                            id: idstock
                        },
                        attributes: ['id', 'coordonnees_gps', 'phone', 'num_enregistrement', 'email', 'sigle', 'cooperative', 'description']
                    }
                ]
            })
                .then(async (rows) => {
                    const __: any[] = []
                    for (let index = 0; index < rows.length; index++) {
                        let items: any[] = []
                        const { __tbl_ecom_produits } = rows[index].toJSON() as any;
                        for (let index = 0; index < __tbl_ecom_produits.length; index++) {
                            const { id, produit, __tbl_ecom_hasproducts } = __tbl_ecom_produits[index] as any;
                            const { TblEcomProduitId, TblEcomCategoryId, TblEcomUnitesmesureId, id_membre, qte_critique } = __tbl_ecom_hasproducts;
                            const member = await Users.findOne({
                                where: {
                                    id: id_membre
                                },
                                attributes: ['id', 'nom', 'postnom', 'prenom', 'phone']
                            })
                            const cat = await Categories.findOne({
                                // raw: true,
                                where: {
                                    id: TblEcomCategoryId
                                }
                            })
                            const uni = await Unites.findOne({
                                // raw: true,
                                where: {
                                    id: TblEcomUnitesmesureId
                                }
                            })
                            items.push({
                                ...__tbl_ecom_produits[index],
                                __tbl_ecom_categories: cat?.toJSON(),
                                __tbl_ecom_unitesmesures: uni?.toJSON(),
                                __tbl_member: member?.toJSON()
                            })
                        }
                        __.push({
                            ...rows[index].toJSON() as any,
                            __tbl_ecom_produits: [...items]
                        })
                    }
                    const infos = getProductDetailsAsRegister({ data: __ })
                    return Responder(res, HttpStatusCode.Ok, { count: infos.length, rows: infos })
                })
                .catch(error => {
                    log(error)
                    return Responder(res, HttpStatusCode.Conflict, error)
                })
        } catch (error) {
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    },
    editpriceonmarketplaec: async (req: Request, res: Response, ) => {
        const {id_produit_on_marketplce:id_produit, price, currency, id_cooperative} = req.body
        const { currentuser } = req as any;
        const { __id } = currentuser;

        if(!id_produit || !price || !currency || !id_cooperative) return Responder(res, 401, "This request must have at least !id_produit || !price || !currency")
        const transaction = await connect.transaction();

        try {

            const hasproduct = await Hasproducts.findOne({
                where: {
                    id: id_produit,
                    TblEcomCooperativeId: id_cooperative
                }
            })

            if(!hasproduct) return Responder(res, HttpStatusCode.NotFound, `Product not found on this server ==> hasProductOnMarketPlace`)
            const pricePlusCommission = await Services.calcProductPrice({unit_price: price, tva: 0})

            hasproduct.update({
                currency: currency,
                prix_unitaire: price,
                prix_plus_commission: pricePlusCommission
            }, {transaction})
            .then(async _ => {
                await transaction.commit()
                return Responder(res, HttpStatusCode.Ok, req.body)
            })
            .catch(async err => {
                await transaction.rollback()
                return Responder(res, HttpStatusCode.InternalServerError, null)
            })

        } catch (error) {
            await transaction.rollback()
            return Responder(res, HttpStatusCode.InternalServerError, error)
        }
    }
}