import { FullProof, MerkleProof } from '@libsem/protocols'
import { MerkleProofArtifacts, ZkProofType } from '@src/types'

export interface ISemaphoreProofRequest {
    externalNullifier: string
    signal: string
    merkleStorageAddress?: string
    circuitFilePath: string
    zkeyFilePath: string
    merkleProofArtifacts?: MerkleProofArtifacts
}

export interface IGetActiveIdentityRequest {
    spamThreshold?: number
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
