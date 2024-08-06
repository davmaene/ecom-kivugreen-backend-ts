import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config()

const { APP_SALTLENGTH } = process.env;

if (!APP_SALTLENGTH) throw Error("The variable APP_SALTLENGTH is not defined in path variable")

export const hashPWD = async ({ plaintext }: { plaintext: string }) => {
    return bcrypt.hash(plaintext, parseInt(APP_SALTLENGTH));
};

export const comparePWD = async ({ plaintext, hashedtext }: { plaintext: string, hashedtext: string }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (typeof plaintext !== 'string') {
                return reject('plaintext is not defined')
            }
            const valide = await bcrypt.compare(plaintext, hashedtext)
            if (valide) return resolve(valide)
            else reject('error pwd not matching')
        } catch (error) {
            reject(error)
        }
    })
};
