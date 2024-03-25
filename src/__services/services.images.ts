import { log } from "console";
import { generateFilename } from "../__helpers/helper.random";
import { Rembg } from "rembg-node";
import sharp from "sharp";

let tempfolder = 'as_tempfolder';

export const ServiceImage = {

    onUploadImage: async ({ inputs: { file, type, saveas }, callBack }: { inputs: { file: any, type: string, saveas: string }, callBack: Function }) => {
        if (!file || !type) return callBack(undefined, { code: 401, message: "This request must have at least file, and type of file !", data: { file, type, saveas } });
        try {
            tempfolder = saveas ? `as_assets` : tempfolder;
            const __file = file['files'][type];
            const filename = generateFilename({ prefix: type, tempname: __file['name'] });
            const uploadPath = 'src/__assets/' + tempfolder + '/' + filename;

            __file.mv(uploadPath, function (err: any) {
                if (err) return callBack(undefined, { code: 500, message: "An error was occured when trying to upload file", data: err })
                else {
                    const slink: string = String(uploadPath).substring(String(uploadPath).indexOf("/") + 1)
                    return callBack(undefined, { code: 200, message: "File uploaded done", data: { filename, fullpath: slink } })
                }
            });

        } catch (error) {
            return callBack(undefined, { code: 500, message: "An error was occured !", data: error })
        }
    },

    onRemoveBGFromImage: async ({ inputs: { filename, directory, saveas, fullpath }, callBack }: { inputs: { filename: string, directory: string, saveas: string, fullpath: string }, callBack: Function }) => {
        if (!filename || !callBack || !directory) return callBack(undefined, { code: 401, message: "This request must have at least {input: filename} and callback" });
        (async () => {
            const input = sharp(fullpath);

            const rembg = new Rembg({
                logging: true,
            });

            const output = await rembg.remove(input);
            const path = `src/__assets/${directory}/`;

            output.trim().jpeg().toFile(`${path}${filename}`)
                .then(rmvd => {
                    return callBack(undefined, { code: 200, message: "Done removing bg", data: { ...rmvd, filename, path: `${path + filename}` } })
                })
                .catch(er => {
                    return callBack(undefined, { code: 500, message: "Error on removing bg", data: er })
                })
        })();
    }
}