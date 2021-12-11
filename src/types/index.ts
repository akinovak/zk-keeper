export type Request = {
    method: string
    payload?: any
    error?: boolean
    meta?: any
}

export type WalletInfo = {
    account: string;
    networkType: string;
    chainId: number;
}

export type CreateInterrepIdentityMetadata = {
    web2Provider: 'Twitter' | 'Reddit' | 'Github'
    nonce?: number
    name?: string
}

export type CreateRandomIdentityMetadata = {
    name?: string
}

export type CreateIdentityMetadata = CreateInterrepIdentityMetadata | CreateRandomIdentityMetadata
export type CreateIdentityStrategy = 'interrep' | 'random'

export type NewIdentityRequest = {
    strategy: CreateIdentityStrategy
    options: any
}

export type ZkInputs = {
    circuitFilePath: string
    zkeyFilePath: string
    merkleStorageAddress: string
}

export enum PendingRequestType {
    PROOF,
    DUMMY,
    APPROVE,
    INJECT
}

export type PendingRequest = {
    id: string
    type: PendingRequestType
    payload?: any
}

export type RequestResolutionAction = 'accept' | 'reject'

export type FinalizedRequest = {
    id: string
    action: RequestResolutionAction
}

export type ApprovalAction = {
    host: string
    action: 'add' | 'remove'
}

export type IdentityMetadata = {
    account: string
    name: string
    provider: string
}

export type SerializedIdentity = {
    metadata: IdentityMetadata
    secret: string
}
