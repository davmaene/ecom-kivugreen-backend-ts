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
}