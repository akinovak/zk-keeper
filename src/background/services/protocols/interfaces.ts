import { FullProof } from "@libsem/protocols";

export interface ISemaphoreProofRequest {
    externalNullifier: string, 
    signal: string,
    merkleStorageAddress: string, 
    circuitFilePath: string, 
    zkeyFilePath: string,
}

export interface ISafeProof {
    fullProof: FullProof,
    solidityProof: any, 
    publicSignals: string[]
}