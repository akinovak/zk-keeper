import { FullProof, MerkleProof } from '@libsem/protocols'


export interface ISemaphoreProofRequest {
    externalNullifier: string
    signal: string
    merkleStorageAddress?: string
    circuitFilePath: string
    zkeyFilePath: string
    merkleProof?: MerkleProof
}

export interface ISafeProof {
    fullProof: FullProof
    solidityProof: any
    publicSignals: string[]
}
