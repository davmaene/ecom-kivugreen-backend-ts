"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    createAction: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
    }),
    findAllAction: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
    }),
    updateAction: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
    }),
    deleteAction: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
    }),
};
