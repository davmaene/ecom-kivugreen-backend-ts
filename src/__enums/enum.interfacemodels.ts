export interface globalInterface {
    id?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    deletedAt?: Date | string;
}

export interface IUsers extends globalInterface {
    nom?: string;
    postnom?: string;
    prenom?: string;
    phone: string;
    email?: string;
    date_naiss?: string;
    sexe?: string;
    avatar?: string;
    idprovince?: number;
    idterritoire?: number;
    idvillage?: number;
    hectare_cultive?: number;
    isvalidated?: number;
    uuid?: string,
    password?: string
}

export interface IRoles extends globalInterface {
    role: string,
    description: string
}

export interface IStocks extends globalInterface {
    transaction: string,
    description?: string,
    // items: number[],
    date_production: string,
    date_expiration: string,
    id_cooperative: number,
    createdby: number
}

export interface IHasrole extends globalInterface {
    TblEcomUserId: number,
    TblEcomRoleId: number
}

export interface IUnite extends globalInterface {
    unity?: string,
    description?: string,
    equival_kgs?: number
}

export interface IProduit extends globalInterface {
    produit: string,
    description?: string,
    id_unity?: number,
    image: string,
    id_category?: number,
    id_souscategory?: number,
    createdby?: number
}

export interface IHasmember extends globalInterface {
    TblEcomUserId: number,
    TblEcomCooperativeId: number
}

export interface IHasproducts extends globalInterface {
    prix_unitaire: number,
    prix_plus_commission: number,
    currency: string,
    qte: number,
    TblEcomProduitId: number,
    TblEcomCategorieId: number,
    TblEcomUnitesmesureId: number,
    // TblEcomUserId: number,
    TblEcomCooperativeId: number
    TblEcomStockId: number
}

export interface IProvinces {
    id?: number,
    province: number,
    createdon?: string,
    status?: number
}

export interface IConfigs extends globalInterface {
    taux_change?: number,
    commission_price?: number,
}

export interface ITerritoires extends globalInterface {
    idprovince: number,
    territoire: string
}

export interface IVillages extends globalInterface {
    village: string,
    latitude: string,
    longitude: string,
    groupement: string,
    provincecode: string,
    idterritoire: number
}

export interface ICooperative extends globalInterface {
    sigle?: string,
    cooperative?: string,
    id_province?: number,
    id_territoire?: number,
    id_responsable?: number,
    id_adjoint?: number,
    description: string,
    coordonnees_gps?: string,
    adresse: string,
    phone: string,
    email: string,
    num_enregistrement: string,
    file: string,
    isformel?: number,
    id_category?: number
}

export interface ICategorie extends globalInterface {
    category?: string,
    description?: string
}
export interface IPayement extends globalInterface {
    realref?: string,
    reference?: string,
    phone: string,
    amount: number,
    currency: string,
    category: number,
    description: string
}

export interface ITypelivraison extends globalInterface {
    type: string,
    description?: string
}

export interface ICommande extends globalInterface {
    transaction: string,
    id_produit: string,
    qte: number,
    type_livraison: number,
    description?: string,
    prix_total: number,
    prix_unit: number,
    currency: string,
    payament_phone: string,
    is_pending: number,
    state: number,
    createdby: number
}

export interface IExtras extends globalInterface {
    verification?: string,
    id_user?: number,
    lastlogin?: number
}

export interface IBank extends globalInterface {
    bank: string,
    email: string,
    phone: string,
    createdby?: number,
    description: string,
    id_responsable: number
}

export interface ISCategorie extends globalInterface {
    souscategory?: string,
    id_category?: number,
    description?: string
}