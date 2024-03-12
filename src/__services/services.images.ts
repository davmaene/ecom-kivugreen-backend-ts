import { generateFilename } from "../helpers/helper.random.js";
import { Rembg } from "rembg-node";
import sharp from "sharp";

let tempfolder = 'as_tempfolder';

export const ServiceImage = {

    onUploadImage: async ({ inputs: { file, type, saveas }, callBack }) => {
        // const { file, type, saveas } = inputs;
        if (!file || !type) return callBack(undefined, { code: 401, message: "This request must have at least file, and type of file !", data: inputs });
        try {
            tempfolder = saveas ? `as_assets` : tempfolder;
            const __file = file['files'][type];
            const filename = generateFilename({ prefix: type, tempname: __file['name'] });
            const uploadPath = 'assets/' + tempfolder + '/' + filename;

            __file.mv(uploadPath, function (err) {
                if (err) return callBack(undefined, { code: 500, message: "An error was occured when trying to upload file", data: err })
                else return callBack(undefined, { code: 200, message: "File uploaded done", data: { filename, fullpath: uploadPath } })
            });

        } catch (error) {
            return callBack(undefined, { code: 500, message: "An error was occured !", data: error })
        }
    },

    onRemoveBGFromImage: async ({ inputs, callBack }) => {
        const { filename, directory } = inputs;
        if (!filename || !callBack || !directory) return callBack(undefined, { code: 401, message: "This request must have at least {input: filename} and callback" });
        (async () => {
            const input = sharp(`assets/${tempfolder}/${filename}`);

            const rembg = new Rembg({
                logging: true,
            });

            const output = await rembg.remove(input);
            const path = `assets/${directory}/`;

            // await output.webp().toFile(`assets/avatar/${filename}`);
            // output.jpeg().toFile()

            // optionally you can use .trim() too!
            // ${randomstring.generate({ length: 32, readable: true, capitalization: true })}.webp

            output.trim().webp().toFile(`${path}${filename}`)
                .then(rmvd => {
                    return callBack(undefined, { code: 200, message: "Done removing bg", data: { ...rmvd, filename, path: `${path + filename}` } })
                })
                .catch(er => {
                    return callBack(undefined, { code: 500, message: "Error on removing bg", data: er })
                })
        })();
    }
}