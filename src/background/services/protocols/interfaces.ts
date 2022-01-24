import { FullProof } from '@zk-kit/protocols'
import { SecretType } from '@zk-kit/identity'
import { MerkleProofArtifacts, ZkProofType } from '@src/types'

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

export interface IGetActiveIdentityRequest {
    secretType: SecretType
    spamThreshold: number
}

export interface IRLNProofRequest extends ISemaphoreProofRequest {
    rlnIdentifier: string
    spamThreshold?: number
}

export interface ISafeProof {
    fullProof: FullProof
    solidityProof: any
    publicSignals: string[]
}
