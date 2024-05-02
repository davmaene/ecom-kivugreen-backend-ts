"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupArrayElementByColumn = exports.formatUserModel = exports.capitalizeWords = exports.truncatestring = exports.checkFileType = exports.imageTypes = exports.groupedDataByColumn = exports.groupArrayByPairs = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { APP_ESCAPESTRING: ESCAPESTRING } = process.env;
const groupArrayByPairs = ({ array }) => {
    const groupedArray = [];
    for (let i = 0; i < array.length; i += 2) {
        if (i + 2 < array.length) {
            groupedArray.push([array[i], array[i + 1]]); //array[i + 3], array[i + 2]
        }
        else {
            groupedArray.push([array[i]]);
        }
    }
    return groupedArray;
};
exports.groupArrayByPairs = groupArrayByPairs;
const groupedDataByColumn = ({ data, column }) => {
    const groupedData = {};
    [...data].forEach(element => {
        const transaction = element[column];
        if (groupedData[transaction]) {
            groupedData[transaction].push(element);
        }
        else {
            groupedData[transaction] = [element];
        }
    });
    return groupedData;
};
exports.groupedDataByColumn = groupedDataByColumn;
exports.imageTypes = [
    { fileType: "JPEG", mimeType: "image/jpeg" },
    { fileType: "PNG", mimeType: "image/png" },
    { fileType: "GIF", mimeType: "image/gif" },
    { fileType: "BMP", mimeType: "image/bmp" },
    { fileType: "TIFF", mimeType: "image/tiff" },
    { fileType: "SVG", mimeType: "image/svg+xml" },
    { fileType: "WEBP", mimeType: "image/webp" },
    // { fileType: "ICO", mimeType: "image/x-icon" },
    // { fileType: "PSD", mimeType: "image/vnd.adobe.photoshop" },
    // { fileType: "EPS", mimeType: "image/eps" }
];
const documentTypes = [
    { fileType: "PDF", mimeType: "application/pdf" },
    { fileType: "DOCX", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
    { fileType: "DOC", mimeType: "application/msword" },
    { fileType: "ODT", mimeType: "application/vnd.oasis.opendocument.text" },
    { fileType: "RTF", mimeType: "application/rtf" },
    { fileType: "TXT", mimeType: "text/plain" },
    { fileType: "CSV", mimeType: "text/csv" },
    { fileType: "XLSX", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
    { fileType: "XLS", mimeType: "application/vnd.ms-excel" },
    { fileType: "PPTX", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
    { fileType: "PPT", mimeType: "application/vnd.ms-powerpoint" },
    { fileType: "ODP", mimeType: "application/vnd.oasis.opendocument.presentation" },
    // { fileType: "HTML", mimeType: "text/html" },
    // { fileType: "XML", mimeType: "application/xml" },
    // { fileType: "JSON", mimeType: "application/json" }
];
const checkFileType = ({ mimetype, as = "doc" || "img" }) => {
    if (exports.imageTypes.map(type => type['mimeType']).includes(mimetype) && as === "img") {
        return { isKnownType: true, mimetype };
    }
    else if (documentTypes.map(type => type['mimeType']).includes(mimetype) && as === "doc") {
        return { isKnownType: true, mimetype };
    }
    else {
        return false;
    }
};
exports.checkFileType = checkFileType;
const truncatestring = ({ string, separator }) => {
    return string.substring(0, string.lastIndexOf(separator));
};
exports.truncatestring = truncatestring;
const capitalizeWords = ({ text }) => {
    return String(text).replace(/\b\w/g, (char) => char.toUpperCase());
};
exports.capitalizeWords = capitalizeWords;
const formatUserModel = ({ model }) => {
    const province = model['__tbl_ecom_province'];
    const territoire = model['__tbl_ecom_territoire'];
    const village = model['__tbl_ecom_village'];
    const roles = model['__tbl_ecom_roles'];
    delete model['__tbl_ecom_roles'];
    delete model['__tbl_ecom_province'];
    delete model['__tbl_ecom_territoire'];
    delete model['__tbl_ecom_village'];
    delete model['idprovince'];
    delete model['idterritoire'];
    delete model['idvillage'];
    delete model['password'];
    delete model['isvalidated'];
    return Object.assign(Object.assign({}, model), { province: (province ? province['province'] : ESCAPESTRING), territoire: (territoire ? territoire['territoire'] : ESCAPESTRING), village: (village ? village['village'] : ESCAPESTRING), roles: (roles.map((r) => r && r['id'])) });
};
exports.formatUserModel = formatUserModel;
const groupArrayElementByColumn = ({ arr, columnName }) => {
    const groups = new Map();
    arr.forEach((item) => {
        const columnValue = item[columnName];
        if (groups.has(columnValue)) {
            groups.get(columnValue).push(item);
        }
        else {
            groups.set(columnValue, [item]);
        }
    });
    return Object.fromEntries(groups);
};
exports.groupArrayElementByColumn = groupArrayElementByColumn;
