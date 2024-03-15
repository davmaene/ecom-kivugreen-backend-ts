export interface globalInterface {
    id?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    deletedAt?: Date | string;
}

export interface IUsers extends globalInterface {
    nom: string;
    postnom: string;
    prenom?: number;
    phone?: string;
    email?: string;
    date_naiss?: string;
    sexe?: string;
    province?: number;
    territoire?: number;
    village?: number;
    hectare_cultive: number
}

export interface IRoles extends globalInterface {
    role: string,
    description: string
}

export interface IHasrole extends globalInterface {
    TblUserId: number,
    TblRoleId: number
}

export interface IProvinces extends globalInterface {
    province: number
}

export interface ITerritoires extends globalInterface {
    idprovince: number,
    territoire: string
}