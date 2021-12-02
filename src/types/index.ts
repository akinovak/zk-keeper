export type Request = {
    method: string;
    payload?: any;
    error?: boolean;
    meta?: any;
};

export type WalletInfo = {
    account: string,
    networkType: string,
}

export type CreateIdentityOption = {
    web2Provider: 'Twitter' | 'Reddit' | 'Github';
    nonce?: number;
    sign: (message: string) => Promise<string>,
    account: string;
}

//TODO add more options
export type NewIdentityRequest = {
    id: string,
    option: CreateIdentityOption
}

export type ZkInputs = {
    circuitFilePath: string,
    zkeyFilePath: string,
    merkleStorageAddress: string
}

export enum PendingRequestType {
    PROOF,
    DUMMY,
    APPROVE,
    INJECT,
  }
//TODO refactor to enum
// export const PROOF = 'proof';
// export const DUMMY = 'dummy';
// export const APPROVE = 'approve';
// export const INJECT = 'inject'
// export type PendingRequestType = 'proof' | 'approve' | 'dummy' | 'inje';

export type PendingRequest = {
    id: string,
    type: PendingRequestType
};

export type RequestResolutionAction = 'accept' | 'reject';

export type FinalizedRequest = {
    id: string,
    action: RequestResolutionAction
}

export type ApprovalAction = {
    host: string,
    action: 'add' | 'remove'
}
