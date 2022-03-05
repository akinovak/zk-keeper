/* eslint-disable @typescript-eslint/no-use-before-define */

import { MerkleProofArtifacts } from '@src/types'
import RPCAction from '@src/util/constants'
import {MerkleProof} from "@zk-kit/protocols";

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


async function getActiveIdentity() {
    return post({
        method: RPCAction.GET_ACTIVE_IDENTITY
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
    merkleProofArtifactsOrStorageAddress: string | MerkleProofArtifacts,
    merkleProof?: MerkleProof,
) {
    const merkleProofArtifacts = typeof merkleProofArtifactsOrStorageAddress === 'string' ? undefined : merkleProofArtifactsOrStorageAddress;
    const merkleStorageAddress = typeof merkleProofArtifactsOrStorageAddress === 'string' ? merkleProofArtifactsOrStorageAddress : undefined;
    return post({
        method: RPCAction.SEMAPHORE_PROOF,
        payload: {
            externalNullifier,
            signal,
            merkleStorageAddress,
            circuitFilePath,
            zkeyFilePath,
            merkleProofArtifacts,
            merkleProof,
        }
    })
}

async function rlnProof(
    externalNullifier: string,
    signal: string,
    circuitFilePath: string,
    zkeyFilePath: string,
    merkleProofArtifactsOrStorageAddress: string | MerkleProofArtifacts,
    rlnIdentifier: string
) {
    const merkleProofArtifacts = typeof merkleProofArtifactsOrStorageAddress === 'string' ? undefined : merkleProofArtifactsOrStorageAddress;
    const merkleStorageAddress = typeof merkleProofArtifactsOrStorageAddress === 'string' ? merkleProofArtifactsOrStorageAddress : undefined;
    return post({
        method: RPCAction.RLN_PROOF,
        payload: {
            externalNullifier,
            signal,
            merkleStorageAddress,
            circuitFilePath,
            zkeyFilePath,
            merkleProofArtifacts,
            rlnIdentifier
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
    getActiveIdentity,
    createDummyRequest,
    semaphoreProof,
    rlnProof,
    // dev-only
    clearApproved
}

/**
 * Connect to Extension
 * @returns injected client
 */
// eslint-disable-next-line consistent-return
async function connect() {
    let result;
    try {
        const approved = await tryInject(window.location.origin)
        const isApproved = (approved as string) === 'approved'
        if (isApproved) {
            await addHost(window.location.origin)
            result = client;
        }
    } catch (err) {
        // eslint-disable-next-line no-console
        console.log('Err: ', err)
        result = null
    }

    await post({ method: RPCAction.CLOSE_POPUP });

    return result
}

declare global {
    interface Window {
        zkpr: {
            connect: () => any
        }
    }
}

window.zkpr = {
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
