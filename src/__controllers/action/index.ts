import { Request, Response, NextFunction } from 'express';
import * as models from '../../__models';
import { HttpStatusCode } from "../../enum/httpStatusCode";
import { IEvenement } from '../../types';

export default {
    createAction: async (req: Request | any, res: Response, next: NextFunction) => {
        // try {
        //     const bodyRequest = req.body;
        //     // const user = req.user.auth;
        //     const { dateDebut, dateFin, is_active, ...body } = bodyRequest;
        //     const evenementResponse = await models.ModelEvenement.create({
        //         dateDebut: dateDebut,
        //         dateFin: dateFin,
        //         is_active: true,
        //         typeEvent: "action",
        //         // agenceId: user.id,
        //     });
        //     if (evenementResponse) {
        //         const response = await models.ModelAction.create({ ...body, evenementId: evenementResponse.id });
        //         if (response) {
        //             res.status(HttpStatusCode.Created).json({ msg: 'Nouvel élément ajouté avec succès', data: response });
        //             return;
        //         } else {
        //             res.status(HttpStatusCode.BadRequest).json({ msg: "Une erreur est survenue. Veuillez réessayer.", data: null });
        //             return
        //         }
        //     } else {
        //         res.status(HttpStatusCode.BadRequest).json({ msg: "Une erreur est survenue. Veuillez réessayer.", data: null });
        //         return
        //     }

        // } catch (error: any) {
        //     res.status(HttpStatusCode.Forbidden).json({ msg: `Une erreur est survenue. ${error.message}`, data: [] });
        //     return
        // }
    },

    findAllAction: async (req: Request, res: Response, next: NextFunction) => {
        // try {
        //     const response = await models.ModelAction.findAll({
        //         include: [
        //             { model: models.ModelEvenement }
        //         ]
        //     });
        //     if (response) {
        //         res.status(HttpStatusCode.Ok).json({ msg: 'Voici la liste des éléments que vous avez demandée ', data: response });
        //         return;
        //     } else {
        //         res.status(HttpStatusCode.BadRequest).json({ msg: "Une erreur est survenue. Veuillez réessayer.", data: null });
        //         return
        //     }
        // } catch (error: any) {
        //     res.status(HttpStatusCode.Forbidden).json({ msg: `Une erreur est survenue. ${error.message}`, data: [] });
        //     return
        // }
    },

    updateAction: async (req: Request, res: Response, next: NextFunction) => {
        // try {
        //     const id = req.query;
        //     const bodyRequest = req.body;
        //     const response = await models.ModelAction.findOne({ where: { id } });
        //     const responseEvenement = await models.ModelEvenement.findOne({ where: { id: response?.evenementId } });
        //     if (response) {
        //         response.set({
        //             boisson: bodyRequest.boisson,
        //             formule: bodyRequest.formule,
        //             evenementId: bodyRequest.evenementId,
        //         });
        //         responseEvenement?.set({
        //             typeEvent: bodyRequest.typeEvent,
        //             dateDebut: bodyRequest.dateDebut,
        //             dateFin: bodyRequest.dateFin,
        //             is_active: bodyRequest.is_active
        //         })

        //         await response.save();
        //         await responseEvenement?.save();
        //     }
        //     if (response) {
        //         res.status(HttpStatusCode.Ok).json({ msg: 'La mise à jour a été effectuée avec succès.', data: response });
        //         return;
        //     } else {
        //         res.status(HttpStatusCode.BadRequest).json({ msg: "Une erreur est survenue. Veuillez réessayer.", data: null });
        //         return
        //     }
        // } catch (error: any) {
        //     res.status(HttpStatusCode.Forbidden).json({ msg: `Une erreur est survenue. ${error.message}`, data: [] });
        //     return
        // }
    },
    
    deleteAction: async (req: Request, res: Response, next: NextFunction) => {
        // try {
        //     const id = req.query;
        //     const response = await models.ModelAction.destroy({ where: { id } });
        //     if (response) {
        //         res.status(HttpStatusCode.Ok).json({ msg: 'La mise à jour a été effectuée avec succès.', data: response });
        //         return;
        //     } else {
        //         res.status(HttpStatusCode.BadRequest).json({ msg: "Une erreur est survenue. Veuillez réessayer.", data: null });
        //         return
        //     }
        // } catch (error: any) {
        //     res.status(HttpStatusCode.Forbidden).json({ msg: `Une erreur est survenue. ${error.message}`, data: [] });
        //     return
        // }
    },
}

