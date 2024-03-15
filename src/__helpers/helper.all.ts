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

export const truncatestring = ({ string, separator }: { string: string, separator: string }) => {
    return string.substring(0, string.lastIndexOf(separator))
};

export const capitalizeWords = ({ text }: { text: string }) => {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const formatUserModel = ({ model }: { model: any }) => {

    const province = model['__tbl_ecom_provinces'];
    const territoire = model['__tbl_ecom_territoires'];
    const village = model['__tbl_ecom_villages'];
    const roles = model['__tbl_ecom_roles'];

    delete model['__tbl_ecom_roles']
    delete model['__tbl_ecom_provinces']
    delete model['__tbl_ecom_territoires']
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

export const groupArrayElementByColumn = ({ arr, columnName }: { arr: any[], columnName: string }) => {

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
