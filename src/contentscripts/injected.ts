import {RPCAction} from "@src/util/constants";

export type IRequest = {
  method: string;
  payload?: any;
  error?: boolean;
  meta?: any;
};


const promises: {
  [k: string]: {
    resolve: Function;
    reject: Function;
  };
} = {};

let nonce = 0;


async function getIdentityCommitments() {
  return post({
    method: RPCAction.GET_COMMITMENTS,
  });
}

async function createDummyRequest() {
  return post({
    method: RPCAction.DUMMY_REQUEST,
  });
}

async function semaphoreProof(
  externalNullifier: string,
  signal: string,
  merkleStorageAddress: string,
  circuitFilePath: string,
  zkeyFilePath: string
  ) {
  return post({
    method: RPCAction.SEMAPHORE_PROOF,
    payload: {
      externalNullifier,
      signal,
      merkleStorageAddress,
      circuitFilePath,
      zkeyFilePath,
    }
  })
}

async function unlock() {
  return post({
    method: 'unlock',
    payload: { password: 'password123' }
  })
}

async function logout() {
  return post({
    method: 'logout',
    payload: { }
  })
}


/**
 * Open Popup
 */
async function openPopup() {
  return post({
    method: 'OPEN_POPUP',
  });
}

async function tryInject(origin: string) {
    return post({
        method: RPCAction.TRY_INJECT,
        payload: { origin }
    });
}

async function addHost(host: string) {
    return post({
        method: RPCAction.APPROVE_HOST,
        payload: { host }
    });
}

/**
 * Injected Client
 */
 const client = {
    openPopup,
    getIdentityCommitments,
    createDummyRequest,
    semaphoreProof,
    unlock,
    logout
  };


/**
 * Connect to Extension
 * @returns injected client
 */
 async function connect() {
    try {
        const approved = await tryInject(window.location.origin);
        const isApproved = approved as string === 'approved';
        if(isApproved) {
            await addHost(window.location.origin);
            return client;
        }
    } catch(err) {
        console.log("Rejected");
    }
}

declare global {
  interface Window {
    injected: {
      connect: () => any;
    };
  }
}


window.injected = {
  connect,
};


// Connect injected script messages with content script messages
async function post(message: IRequest) {
  return new Promise((resolve, reject) => {
    const messageNonce = nonce++;
    window.postMessage({
      target: 'injected-contentscript',
      message: {
        ...message,
        type: message.method,
      },
      nonce: messageNonce,
    }, '*');

    promises[messageNonce] = { resolve, reject };
  });
}

window.addEventListener('message', (event) => {
  const data = event.data;
  if (data && data.target === 'injected-injectedscript') {
    if (!promises[data.nonce]) return;

    const [err, res] = data.payload;
    const {resolve, reject} = promises[data.nonce];

    if (err) {
      return reject(new Error(err));
    }

    resolve(res);

    delete promises[data.nonce];
  }
});
