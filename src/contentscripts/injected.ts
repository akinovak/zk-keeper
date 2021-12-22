/* eslint-disable @typescript-eslint/no-use-before-define */

import RPCAction from '@src/util/constants'

export type IRequest = {
    method: string
    payload?: any
    error?: boolean
    meta?: any
}

const promises: {
    [k: string]: {
        resolve: Function
        reject: Function
    }
} = {}

let nonce = 0

async function getIdentityCommitments() {
    return post({
        method: RPCAction.GET_COMMITMENTS
    })
}

async function createDummyRequest() {
    return post({
        method: RPCAction.DUMMY_REQUEST
    })
}

async function semaphoreProof(
    externalNullifier: string,
    signal: string,
    circuitFilePath: string,
    zkeyFilePath: string,
    merkleProofOrStorageAddress: string | {
        root: string
        indices: Array<any>
        pathElements: Array<any>
    },
) {
    const merkleProof = typeof merkleProofOrStorageAddress === 'string' ? undefined : merkleProofOrStorageAddress;
    const merkleStorageAddress = typeof merkleProofOrStorageAddress === 'string' ? merkleProofOrStorageAddress : undefined;
    return post({
        method: RPCAction.SEMAPHORE_PROOF,
        payload: {
            externalNullifier,
            signal,
            merkleStorageAddress,
            merkleProof,
            circuitFilePath,
            zkeyFilePath
        }
    })
}

async function rlnProof(
    externalNullifier: string,
    signal: string,
    circuitFilePath: string,
    zkeyFilePath: string,
    merkleProofOrStorageAddress: string | {
        root: string
        indices: Array<any>
        pathElements: Array<any>
    },
   rlnIdentifier: string
) {
    const merkleProof = typeof merkleProofOrStorageAddress === 'string' ? undefined : merkleProofOrStorageAddress;
    const merkleStorageAddress = typeof merkleProofOrStorageAddress === 'string' ? merkleProofOrStorageAddress : undefined;
    return post({
        method: RPCAction.RLN_PROOF,
        payload: {
            externalNullifier,
            signal,
            merkleStorageAddress,
            merkleProof,
            circuitFilePath,
            zkeyFilePath,
            rlnIdentifier
        }
    })
}


async function nRlnProof(
    externalNullifier: string,
    signal: string,
    circuitFilePath: string,
    zkeyFilePath: string,
    merkleProofOrStorageAddress: string | {
        root: string
        indices: Array<any>
        pathElements: Array<any>
    },
   rlnIdentifier: string,
   spamThreshold: number
) {
    const merkleProof = typeof merkleProofOrStorageAddress === 'string' ? undefined : merkleProofOrStorageAddress;
    const merkleStorageAddress = typeof merkleProofOrStorageAddress === 'string' ? merkleProofOrStorageAddress : undefined;
    return post({
        method: RPCAction.NRLN_PROOF,
        payload: {
            externalNullifier,
            signal,
            merkleStorageAddress,
            merkleProof,
            circuitFilePath,
            zkeyFilePath,
            rlnIdentifier,
            spamThreshold
        }
    })
}


// dev-only
async function clearApproved() {
    return post({
        method: RPCAction.CLEAR_APPROVED_HOSTS
    })
}

/**
 * Open Popup
 */
async function openPopup() {
    return post({
        method: 'OPEN_POPUP'
    })
}

async function tryInject(origin: string) {
    return post({
        method: RPCAction.TRY_INJECT,
        payload: { origin }
    })
}

async function addHost(host: string) {
    return post({
        method: RPCAction.APPROVE_HOST,
        payload: { host }
    })
}

/**
 * Injected Client
 */
const client = {
    openPopup,
    getIdentityCommitments,
    createDummyRequest,
    semaphoreProof,
    rlnProof,
    nRlnProof,
    // dev-only
    clearApproved
}

/**
 * Connect to Extension
 * @returns injected client
 */
// eslint-disable-next-line consistent-return
async function connect() {
    try {
        const approved = await tryInject(window.location.origin)
        const isApproved = (approved as string) === 'approved'
        if (isApproved) {
            await addHost(window.location.origin)
            return client
        }
    } catch (err) {
        // eslint-disable-next-line no-console
        console.log('Err: ', err)
        return null
    }
}

declare global {
    interface Window {
        injected: {
            connect: () => any
        }
    }
}

window.injected = {
    connect
}

// Connect injected script messages with content script messages
async function post(message: IRequest) {
    return new Promise((resolve, reject) => {
        // eslint-disable-next-line no-plusplus
        const messageNonce = nonce++
        window.postMessage(
            {
                target: 'injected-contentscript',
                message: {
                    ...message,
                    type: message.method
                },
                nonce: messageNonce
            },
            '*'
        )

        promises[messageNonce] = { resolve, reject }
    })
}

window.addEventListener('message', (event) => {
    const { data } = event
    if (data && data.target === 'injected-injectedscript') {
        if (!promises[data.nonce]) return

        const [err, res] = data.payload
        const { resolve, reject } = promises[data.nonce]

        if (err) {
            // eslint-disable-next-line consistent-return
            return reject(new Error(err))
        }

        resolve(res)

        delete promises[data.nonce]
    }
})
