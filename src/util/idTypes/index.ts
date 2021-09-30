import {IdentityData} from "./interrep";

export enum IdentityType {
    SEMAPHORE = 'semaphore',
}

export enum Hasher {
    POSEIDON = 'poseidon',
    PEDERSEN = 'pedersen',
}

export type SafeIdentity = {
    idProvider: 'interrep',
    data: IdentityData,
    type: IdentityType,
    hasher: Hasher,
}

export type FullIdentity = SafeIdentity & {
    _keys: {
        publicKey: string[],
        privateKey: string,
    },
    _secrets: {
        nullifier: string,
        trapdoor: string,
    },
    _seed: {
        entropy: string,
        account: string,
    },
}