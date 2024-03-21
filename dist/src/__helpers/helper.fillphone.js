"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeCodeCountryToPhoneNumber = exports.fillphone = void 0;
const fillphone = ({ phone }) => {
    switch (phone.charAt(0)) {
        case '0': return String(phone);
        case '+': return String(`0${phone.substring(4)}`);
        case '2': return String(`0${phone.substring(3)}`);
        default: return String(`0${phone}`);
    }
};
exports.fillphone = fillphone;
const completeCodeCountryToPhoneNumber = ({ phone }) => {
    phone = phone ? phone.toString() : '0';
    const cdcode = '243';
    switch (phone.charAt(0)) {
        case '0':
            phone = String(`${cdcode}${phone.substring(1)}`);
            break;
        case '+':
            phone = String(`${cdcode}${phone.substring(4)}`);
            break;
        case '2':
            phone = String(`${cdcode}${phone.substring(3)}`);
            break;
        default:
            phone = String(`${cdcode}${phone.substring(1)}`);
            break;
    }
    return '+'.concat(phone);
};
exports.completeCodeCountryToPhoneNumber = completeCodeCountryToPhoneNumber;
