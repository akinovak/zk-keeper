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
        publicKey: String[],
        privateKey: String,
    },
    _secrets: {
        nullifier: String,
        trapdoor: String,
    },
    _seed: {
        entropy: String,
        account: String,
    },
}