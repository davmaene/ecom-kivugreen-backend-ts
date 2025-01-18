export interface globalInterface {
    id?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    deletedAt?: Date | string;
    createdBy?: number | string;
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
    __tbl_ecom_roles?: any;
}

export interface ICarousel extends globalInterface {
    carousel: string,
    title: string,
    status: number,
    sub_title?: string,
    description: string,
    createdBy: number
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
    unity: string,
    description?: string,
    equival_kgs?: number
}

export interface IProduit extends globalInterface {
    produit: string,
    tva: number,
    description?: string,
    id_unity?: number,
    image: string,
    id_category?: number,
    id_souscategory?: number,
    createdby?: number
}

export interface IHasmember extends globalInterface {
    TblEcomUserId: number,
    TblEcomCooperativeId: number,
    carte: string,
    date_expiration: string,
    date_expiration_unix: string,
    is_payed?: number
}

export interface IHasproducts extends globalInterface {
    id_membre?: number[],
    qte_critique?: number,
    prix_unitaire: number,
    prix_plus_commission: number,
    currency: string,
    date_production: string,
    qte: number,
    tva: number,
    TblEcomProduitId: number,
    TblEcomCategoryId: number,
    TblEcomUnitesmesureId: number,
    // TblEcomUserId: number,
    TblEcomCooperativeId: number
    TblEcomStockId: number
}

export interface IHistoriesstock extends globalInterface {
    // id_membres: number[],
    // qte_critique?: number,
    // prix_unitaire: number,
    // prix_plus_commission: number,
    // currency: string,
    // tva: number,
    date_production: string,
    qte: number,
    TblEcomProduitId: number,
    TblEcomCategoryId: number,
    TblEcomUnitesmesureId: number,
    TblEcomUserId: number,
    TblEcomStockId: number,
    TblEcomCooperativeId: number
}
export interface IMembershasrechargedstock extends globalInterface {
    TblEcomUserId: number,
    qte: number,
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

export interface ICredits extends globalInterface {
    id_cooperative: number,
    id_user?: number,
    validated_by_bank?: number,
    montant: number,
    currency: string,
    motif: string,
    periode_remboursement: number,
    status: number,
    createdat: string,
    created_at: string
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
    logo?: string,
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
    customer_phone: string,
    reference?: string,
    phone: string,
    amount: number,
    currency: string,
    category: number,
    description: string,
    createdby: number,
    status?: number
}

export interface ITypelivraison extends globalInterface {
    type: string,
    description?: string,
    frais_livraison: number,
    quantite: number,
    lieux?: number[]
}

export interface INewsletter extends globalInterface {
    email: string,
    description?: string,
}

export interface IValidatorcodeondelivery extends globalInterface {
    id_transaction: string,
    description?: string,
    id_customer?: number,
    id_livreur?: number,
    code_livraison: string
}

export interface ICommande extends globalInterface {
    transaction: string,
    id_produit: number,
    id_unity: number,
    real_transaction?: string,
    qte: number,
    id_cooperative: number,
    type_livraison: number,
    description?: string,
    prix_total: number,
    prix_unit: number,
    currency: string,
    payament_phone: string,
    is_pending: number,
    state: number,
    createdby: number,
    shipped_to: string,
    updatedby?: number
}

export interface IExtras extends globalInterface {
    verification?: string,
    id_user?: number,
    lastlogin?: number,
    carte?: string,
    date_expiration?: string,
    date_expiration_unix?: string
}

export interface ICategscoopecs extends globalInterface {
    category: string,
    description?: string
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