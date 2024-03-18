import { generateRandomString } from "ts-randomstring/lib";
import dotenv from 'dotenv';

dotenv.config();

const { APP_NAME: APPNAME } = process.env;

export const generateIdentifier = ({ prefix }: { prefix: string }) => {
    const pfx = Math.floor(Math.random() * 1000);
    const sfx = Math.floor(Math.random() * 100);

    return `${prefix ? String(prefix).toUpperCase().concat("-") : ""}${randomLongNumber({ length: 6 })}`;
};

export const generateFilename = ({ prefix, tempname }: { prefix: string, tempname: string }) => {
    const extension = tempname.substring(tempname.lastIndexOf("."));
    return `${prefix ? prefix + "-" : ""}${generateRandomString({ length: 23 })}${extension}`;
};

export const randomLongNumber = ({ length }: { length: number }) => {
    const len = length && !isNaN((length)) ? length : 6;
    const ret = [];

    for (let k = 0; k < len; k++) ret.push(
        Math.floor(Math.random() * 10)
    );

    let m = ret.join().toString();
    m = m.replace(/,/g, "");
    return m.trim();
};

export const randomLongNumberWithPrefix = ({ length }: { length: number }) => {
    const prefix = APPNAME;
    const len = length && !isNaN((length)) ? length : 6;
    const ret = [];

    for (let k = 0; k < len; k++) ret.push(
        Math.floor(Math.random() * 10)
    );

    let m = ret.join().toString();
    m = m.replace(/,/g, "");
    return `${prefix}${m.trim()}`;
};

export const randomString = () => generateRandomString({ length: 32 })
