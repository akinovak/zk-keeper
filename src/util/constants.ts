export enum RPCAction {
    CONNECT_METAMASK = 'rpc/metamask/connectMetamask',
    GET_WALLET_INFO = 'rpc/metamask/getWalletInfo',
    CREATE_IDENTITY = 'rpc/identity/createIdentity',
    GET_IDENTITIES = 'rpc/identity/getIdentities',
    GET_REQUEST_PENDING_STATUS = 'rpc/identity/getRequestPendingStatus',
    REQUEST_IDENTITIES = 'rpc/identity/requestIdentities',
    CONFIRM_REQUEST = 'rpc/identity/confirmRequest',
    REJECT_REQUEST = 'rpc/identity/rejectRequest',
}