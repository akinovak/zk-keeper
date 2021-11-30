export type IRequest = {
    method: string;
    payload?: any;
    error?: boolean;
    meta?: any;
};

export type WalletInfo = {
    account: string,
    networkType: string,
}

export type CreateIdentityOption = {
    web2Provider: 'Twitter' | 'Reddit' | 'Github';
    nonce?: number;
    sign: (message: string) => Promise<string>,
    account: string;
}

//TODO add more options
export type NewIdentityRequest = {
    providerId: string, 
    option: CreateIdentityOption
}