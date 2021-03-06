enum RPCAction {
    UNLOCK = 'rpc/unlock',
    LOCK = 'rpc/lock',
    GET_STATUS = 'rpc/getStatus',
    TRY_INJECT = 'rpc/inject',
    SETUP_PASSWORD = 'rpc/lock/setupPassword',
    CONNECT_METAMASK = 'rpc/metamask/connectMetamask',
    GET_WALLET_INFO = 'rpc/metamask/getWalletInfo',
    CREATE_IDENTITY = 'rpc/identity/createIdentity',
    SET_ACTIVE_IDENTITY = 'rpc/identity/setActiveIdentity',
    GET_ACTIVE_IDENTITY = 'rpc/identity/getActiveidentity',
    GET_COMMITMENTS = 'rpc/identity/getIdentityCommitments',
    GET_IDENTITIES = 'rpc/identity/getIdentities',
    GET_REQUEST_PENDING_STATUS = 'rpc/identity/getRequestPendingStatus',
    FINALIZE_REQUEST = 'rpc/requests/finalize',
    GET_PENDING_REQUESTS = 'rpc/requests/get',
    SEMAPHORE_PROOF = 'rpc/protocols/semaphore/genProof',
    RLN_PROOF = 'rpc/protocols/rln/genProof',
    NRLN_PROOF = 'rpc/protocols/nrln/genProof',
    DUMMY_REQUEST = 'rpc/protocols/semaphore/dummyReuqest',
    REQUEST_ADD_REMOVE_APPROVAL = 'rpc/hosts/request',
    APPROVE_HOST = 'rpc/hosts/approve',
    IS_HOST_APPROVED = 'rpc/hosts/isHostApprove',
    REMOVE_HOST = 'rpc/hosts/remove',
    // DEV RPCS
    CLEAR_APPROVED_HOSTS = 'rpc/hosts/clear'
}
export default RPCAction
