import { FullProof, MerkleProof } from '@libsem/protocols'


export interface ISemaphoreProofRequest {
    externalNullifier: string
    signal: string
    merkleStorageAddress?: string
    circuitFilePath: string
    zkeyFilePath: string
    merkleProof?: MerkleProof
}

export interface IRLNProofRequest extends ISemaphoreProofRequest {
    rlnIdentifier: string
}

export interface INRLNProofRequest extends IRLNProofRequest {
    spamThreshold: number
}

export interface ISafeProof {
    fullProof: FullProof
    solidityProof: any
    publicSignals: string[]
}
