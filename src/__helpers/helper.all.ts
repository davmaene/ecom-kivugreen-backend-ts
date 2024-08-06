import dotenv from 'dotenv';

dotenv.config();

const { APP_ESCAPESTRING: ESCAPESTRING } = process.env;

export const groupArrayByPairs = ({ array }: { array: any[] }) => {
    const groupedArray = [];
    for (let i = 0; i < array.length; i += 2) {
        if (i + 2 < array.length) {
            groupedArray.push([array[i], array[i + 1]]); //array[i + 3], array[i + 2]
        } else {
            groupedArray.push([array[i]]);
        }
    }
    return groupedArray;
};

export const groupedDataByColumn = ({ data, column }: { data: any[], column: string }): any[] => {
    const groupedData: any = {};
    [...data].forEach(element => {
        const transaction = element[column];
        if (groupedData[transaction]) {
            groupedData[transaction].push(element);
        } else {
            groupedData[transaction] = [element];
        }
    });
    return groupedData
};

export const imageTypes = [
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

export const documentTypes = [
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

export const renderState = ({ state }: { state: number }): { color: any, name: string } => {
    const states: any = {
        0: {
            color: null,
            name: "Commande non payée"
        },
        1: {
            color: null,
            name: "Commande annulée"
        },
        2: {
            color: null,
            name: "En cours de livraison par KGreen"
        },
        3: {
            color: null,
            name: "Commande payée possibilité de livraison"
        },
        4: {
            color: null,
            name: "Commande livrée avec succès"
        }
    }

    return states[state] || { color: null, name: null }
};

export const validatePhoneNumber = ({ phoneNumber }: { phoneNumber: string }) => {
    const phoneRegex = /^(\+?\d{1,3}[-. ]?)?(\(?\d{3}\)?[-. ]?)?[\d-. ]{7,10}$/;
    return phoneRegex.test(phoneNumber);
}

export const checkFileType = ({ mimetype, as = "doc" || "img" }: { mimetype: string, as: string }): { mimetype: string, isKnownType: boolean } | false => {
    if (imageTypes.map(type => type['mimeType']).includes(mimetype) && as === "img") {
        return { isKnownType: true, mimetype };
    } else if (documentTypes.map(type => type['mimeType']).includes(mimetype) && as === "doc") {
        return { isKnownType: true, mimetype };
    } else {
        return false;
    }
};

export const truncatestring = ({ string, separator }: { string: string, separator: string }) => {
    return string.substring(0, string.lastIndexOf(separator))
};

export const capitalizeWords = ({ text }: { text?: string }) => {
    return String(text).replace(/\b\w/g, (char) => char.toUpperCase());
};

export const formatUserModel = ({ model }: { model: any }) => {

    const province = model['__tbl_ecom_province'];
    const territoire = model['__tbl_ecom_territoire'];
    const village = model['__tbl_ecom_village'];
    const roles = model['__tbl_ecom_roles'];

    delete model['__tbl_ecom_roles']
    delete model['__tbl_ecom_province']
    delete model['__tbl_ecom_territoire']
    delete model['__tbl_ecom_village']
    delete model['idprovince']
    delete model['idterritoire']
    delete model['idvillage']
    delete model['password']
    delete model['isvalidated']

    return {
        ...model,
        province: (province ? province['province'] : ESCAPESTRING),
        territoire: (territoire ? territoire['territoire'] : ESCAPESTRING),
        village: (village ? village['village'] : ESCAPESTRING),
        roles: (roles.map((r: any) => r && r['id']))
    }
};

export const groupArrayElementByColumn = ({ arr, columnName, convertColumn }: { arr: any[], columnName: string, convertColumn: boolean }) => {

    const groups = new Map();

    arr.forEach((item) => {
        const columnValue = item[columnName];
        if (groups.has(columnValue)) {
            groups.get(columnValue).push(item);
        } else {
            groups.set(columnValue, [item]);
        }
    });
    return Object.fromEntries(groups);
};

export const supprimerDoublons = ({ tableau }: { tableau: number[] }) => {
    const tableauUnique = tableau.filter((element, index) => tableau.indexOf(element) === index);
    return tableauUnique;
}
