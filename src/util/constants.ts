export enum RPCAction {
    CONNECT_METAMASK = 'rpc/metamask/connectMetamask',
    GET_WALLET_INFO = 'rpc/metamask/getWalletInfo',
    CREATE_IDENTITY = 'rpc/identity/createIdentity',
    SET_ACTIVE_IDENTITY = 'rpc/identity/setActiveIdentity',
    GET_COMMITMENTS = 'rpc/identity/getIdentityCommitments',
    GET_REQUEST_PENDING_STATUS = 'rpc/identity/getRequestPendingStatus',
    // REQUEST_IDENTITIES = 'rpc/identity/requestIdentities',
    // CONFIRM_REQUEST = 'rpc/identity/confirmRequest',
    // REJECT_REQUEST = 'rpc/identity/rejectRequest',
    SEMAPHORE_PROOF = 'rpc/protocols/semaphore/genProof'
}