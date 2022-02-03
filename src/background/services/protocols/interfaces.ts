import { FullProof } from '@zk-kit/protocols'
import { MerkleProofArtifacts } from '@src/types'

export enum Protocol {
    SEMAPHORE,
    RLN,
    NRLN
}

export interface ISemaphoreProofRequest {
    externalNullifier: string
    signal: string
    merkleStorageAddress?: string
    circuitFilePath: string
    zkeyFilePath: string
    merkleProofArtifacts?: MerkleProofArtifacts
}

export interface IRLNProofRequest extends ISemaphoreProofRequest {
    rlnIdentifier: string
}

export interface ISafeProof {
    fullProof: FullProof
    solidityProof: any
    publicSignals: string[]
}
