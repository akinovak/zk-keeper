import semethid from "@interrep/semethid"
import { ZkIdentity } from "@libsem/identity"

export const providerId = 'interrep';

export type CreateIdentityOption = {
    web2Provider: 'Twitter' | 'Reddit' | 'Github';
    nonce?: number;
    sign: (message: string) => Promise<string>,
    account: string;
}

export const createIdentity = async (option: CreateIdentityOption): Promise<ZkIdentity> => {
    const {web2Provider, nonce = 0, sign, account} = option || {};

    if (typeof web2Provider === 'undefined') throw new Error('no web2Provider');
    if (typeof nonce === 'undefined') throw new Error('no nonce');
    if (typeof sign === 'undefined') throw new Error('no sign function');
    if (typeof account === 'undefined') throw new Error('no account');

    return semethid(sign, web2Provider, nonce);
}