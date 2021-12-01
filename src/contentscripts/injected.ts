import {MessageAction} from "@src/util/postMessage";
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


/**
 * Connect to Extension
 * @returns injected client
 */
async function connect() {
  return client;
}

async function getIdentityCommitments() {
  return post({
    method: 'getIdentityCommitments',
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
  merkleServiceAddress: string,
  circuitFilePath: string,
  zkeyFilePath: string
  ) {
  return post({
    method: RPCAction.SEMAPHORE_PROOF,
    payload: {
      externalNullifier,
      signal,
      merkleServiceAddress, 
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

window.injected = {
  connect,
};

declare global {
  interface Window {
    injected: {
      connect: () => Promise<typeof client>;
    };
  }
}

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
