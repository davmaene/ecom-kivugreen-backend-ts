import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config()

const { API_SMS_ENDPOINT, APP_NAME, API_SMS_TOKEN, API_SMS_IS_FLASH } = process.env

export const Services = {
    SMSServices: async ({ to, content, is_flash }: { to: string, content: string, is_flash: boolean }) => {
        return new Promise(async (resolve, reject) => {
            try {
                const payload = {
                    'phone': to,
                    'message': content,
                    'is_flash': is_flash || API_SMS_IS_FLASH,
                    'app': APP_NAME
                };
                const { data, status, request, config, headers, statusText } = await axios({
                    method: "POST",
                    url: API_SMS_ENDPOINT,
                    data: payload,
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${API_SMS_TOKEN}`
                    }
                })

                if (status === 200) return resolve({ code: 200, message: "Message was succefuly sent ", data: data })
                else return reject({ code: status, message: statusText, data })

            } catch (error: any) {
                return reject({ code: 500, message: "Error on sending message", data: error })
            }
        })
    }
}