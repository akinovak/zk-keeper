import {Identity, OrdinarySemaphore} from "semaphore-lib";
import semethid from "@interrep/semethid";
import {FullIdentity, Hasher, IdentityType} from "@src/util/idTypes/index";

OrdinarySemaphore.setHasher('poseidon');

export const providerId = 'interrep';

export type IdentityData = {
    web2Provider: 'Twitter' | 'Reddit' | 'Github';
    idCommitment: string,
}

export type CreateIdentityOption = {
    web2Provider: 'Twitter' | 'Reddit' | 'Github';
    nonce: number;
    sign: (message: string) => Promise<string>,
    account: string;
}

export const createIdentity = async (option: CreateIdentityOption): Promise<FullIdentity> => {
    const {web2Provider, nonce = 0, sign, account} = option || {};

    if (typeof web2Provider === 'undefined') throw new Error('no web2Provider');
    if (typeof nonce === 'undefined') throw new Error('no nonce');
    if (typeof sign === 'undefined') throw new Error('no sign function');
    if (typeof account === 'undefined') throw new Error('no account');

    let entropy = '';

    const identity: Identity = await semethid(
        (m: string) => {
            entropy = m;
            return sign(m);
        },
        web2Provider,
        nonce,
    );

    const commitment = await OrdinarySemaphore.genIdentityCommitment(identity);

    return {
        idProvider: providerId,
        type: IdentityType.SEMAPHORE,
        hasher: Hasher.POSEIDON,
        data: {
            web2Provider,
            idCommitment: '0x' + commitment.toString(16),
        },
        _seed: {
            entropy,
            account,
        },
        _secrets: {
            nullifier: '0x' + identity.identityNullifier.toString(16),
            trapdoor: '0x' + identity.identityTrapdoor.toString(16),
        },
        _keys: {
            privateKey: identity.keypair.privKey.toString('hex'),
            publicKey: identity.keypair.pubKey.map(k => '0x' + k.toString(16)),
        },
    };
}