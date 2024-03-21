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
exports.ServiceImage = void 0;
const helper_random_1 = require("../__helpers/helper.random");
const rembg_node_1 = require("rembg-node");
const sharp_1 = __importDefault(require("sharp"));
let tempfolder = 'as_tempfolder';
exports.ServiceImage = {
    onUploadImage: ({ inputs: { file, type, saveas }, callBack }) => __awaiter(void 0, void 0, void 0, function* () {
        if (!file || !type)
            return callBack(undefined, { code: 401, message: "This request must have at least file, and type of file !", data: { file, type, saveas } });
        try {
            tempfolder = saveas ? `as_assets` : tempfolder;
            const __file = file['files'][type];
            const filename = (0, helper_random_1.generateFilename)({ prefix: type, tempname: __file['name'] });
            const uploadPath = 'src/__assets/' + tempfolder + '/' + filename;
            __file.mv(uploadPath, function (err) {
                if (err)
                    return callBack(undefined, { code: 500, message: "An error was occured when trying to upload file", data: err });
                else
                    return callBack(undefined, { code: 200, message: "File uploaded done", data: { filename, fullpath: uploadPath } });
            });
        }
        catch (error) {
            return callBack(undefined, { code: 500, message: "An error was occured !", data: error });
        }
    }),
    onRemoveBGFromImage: ({ inputs: { filename, directory, saveas, fullpath }, callBack }) => __awaiter(void 0, void 0, void 0, function* () {
        if (!filename || !callBack || !directory)
            return callBack(undefined, { code: 401, message: "This request must have at least {input: filename} and callback" });
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const input = (0, sharp_1.default)(fullpath);
            const rembg = new rembg_node_1.Rembg({
                logging: true,
            });
            const output = yield rembg.remove(input);
            const path = `src/__assets/${directory}/`;
            output.trim().jpeg().toFile(`${path}${filename}`)
                .then(rmvd => {
                return callBack(undefined, { code: 200, message: "Done removing bg", data: Object.assign(Object.assign({}, rmvd), { filename, path: `${path + filename}` }) });
            })
                .catch(er => {
                return callBack(undefined, { code: 500, message: "Error on removing bg", data: er });
            });
        }))();
    })
};
