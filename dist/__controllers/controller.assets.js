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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__controlerAssets = void 0;
const enum_httpsstatuscode_1 = require("../__enums/enum.httpsstatuscode");
const helper_responseserver_1 = require("../__helpers/helper.responseserver");
const path_1 = __importDefault(require("path"));
exports.__controlerAssets = {
    getressoursesavatar: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { ressources } = req.params;
        const folder = "as_avatar";
        try {
            return res
                .status(200)
                .sendFile(path_1.default.resolve(`src/__assets/${folder}/${ressources}`), (error) => {
                if (error) {
                    console.log(`no ressource found with the name | Profile | : ${ressources}`);
                    return res.sendFile(path_1.default.resolve(`src/__assets/${folder}/defaultavatar.png`));
                }
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    getressourses: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { ressources } = req.params;
        const folder = "as_assets";
        try {
            return res
                .status(200)
                .sendFile(path_1.default.resolve(`assets/${folder}/${ressources}`), (error) => {
                if (error) {
                    console.log(`no ressource found with the name | Profile | : ${ressources}`);
                    return res.sendFile(path_1.default.resolve(`assets/${folder}/defaultavatar.png`));
                }
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    getanyressourses: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { ressources } = req.params;
        const folder = "as_assets";
        try {
            return res
                .status(200)
                .sendFile(path_1.default.resolve(`src/__assets/${folder}/${ressources}`), (error) => {
                if (error) {
                    console.log(`no ressource found with the name : ${ressources}`);
                    return res.sendFile(path_1.default.resolve(`src/__assets/${folder}/defaultproduit.jpg`));
                }
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    getressoursesasproduct: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { ressources } = req.params;
        const folder = "as_products";
        try {
            return res
                .status(200)
                .sendFile(path_1.default.resolve(`assets/${folder}/${ressources}`), (error) => {
                if (error) {
                    console.log(`no ressource found with the name | Product | : ${ressources}`);
                    return res.sendFile(path_1.default.resolve(`assets/${folder}/defaultproduit.jpg`));
                }
            });
        }
        catch (error) {
            return (0, helper_responseserver_1.Responder)(res, enum_httpsstatuscode_1.HttpStatusCode.InternalServerError, error);
        }
    }),
    // setressourcesasavatar: async (req, res, next) => {
    //     const { iduser } = req.body;
    //     const { avatar } = req.files;
    //     if (!iduser || !avatar) return Response(res, 401, "This request must have at least iduser and avatar")
    //     try {
    //         const user = await Users.findOne({
    //             where: {
    //                 id: parseInt(iduser)
    //             }
    //         })
    //         if (user instanceof Users) {
    //             ServiceImage.onUploadImage({
    //                 inputs: {
    //                     file: req,
    //                     type: 'avatar'
    //                 },
    //                 callBack: (err, done) => {
    //                     if (done) {
    //                         const { code, message, data } = done;
    //                         ServiceImage.onRemoveBGFromImage({
    //                             inputs: {
    //                                 ...data,
    //                                 directory: 'as_avatar'
    //                             },
    //                             callBack: (er, success) => {
    //                                 if (success) {
    //                                     const { code, message, data } = success;
    //                                     if (code === 200) {
    //                                         const { filename, path } = data;
    //                                         user.update({
    //                                             avatar: path
    //                                         })
    //                                         return Response(res, 200, data)
    //                                     } else {
    //                                         return Response(res, 400, "Failed to remove bg to the file sorry !")
    //                                     }
    //                                 } else {
    //                                     return Response(res, 500, er)
    //                                 }
    //                             }
    //                         })
    //                     } else {
    //                         return Response(res, 400, "Bad request was sent into procedur !")
    //                     }
    //                 }
    //             })
    //         } else {
    //             return Response(res, 404, {
    //                 message: `User with ID ${iduser} was not found on this server`,
    //                 user
    //             })
    //         }
    //     } catch (error) {
    //         return Response(res, 500, error)
    //     }
    // },
    // setressourcesasproduct: async (req, res, next) => {
    //     const { idproduit } = req.body;
    //     const { product } = req.files;
    //     if (!idproduit || !product) return Response(res, 401, "This request must have at least idproduit and avatar")
    //     try {
    //         ServiceImage.onUploadImage({
    //             inputs: {
    //                 file: req,
    //                 type: 'product'
    //             },
    //             callBack: (err, done) => {
    //                 if (done) {
    //                     const { code, message, data } = done;
    //                     ServiceImage.onRemoveBGFromImage({
    //                         inputs: {
    //                             ...data,
    //                             directory: 'as_products'
    //                         },
    //                         callBack: (er, success) => {
    //                             if (success) {
    //                                 const { code, message, data } = success;
    //                                 if (code === 200) {
    //                                     return Response(res, 200, data)
    //                                 } else {
    //                                     return Response(res, 400, "Failed to remove bg to the file sorry !")
    //                                 }
    //                             } else {
    //                                 return Response(res, 500, er)
    //                             }
    //                         }
    //                     })
    //                 } else {
    //                     return Response(res, 400, "Bad request was sent into procedur !")
    //                 }
    //             }
    //         })
    //     } catch (error) {
    //         return Response(res, 500, error)
    //     }
    // }
};
