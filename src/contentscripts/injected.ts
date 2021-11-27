import {MessageAction} from "@src/util/postMessage";
import {RPCAction} from "@src/util/constants";


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

/**
 * Get Identity
 * //TODO add some strategy here, like latest, etc...
 */
async function getIdentityCommitments() {
  return post({
    type: RPCAction.GET_COMMITMENTS,
    payload: {},
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
    type: RPCAction.SEMAPHORE_PROOF,
    payload: {
      externalNullifier,
      signal,
      merkleServiceAddress, 
      circuitFilePath, 
      zkeyFilePath, 
    }
  })
  
}



/**
 * Open Popup
 */
async function openPopup() {
  return post({
    type: 'OPEN_POPUP',
  });
}


/**
 * Injected Client
 */
const client = {
  openPopup,
  getIdentityCommitments,
  semaphoreProof
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
async function post(message: MessageAction) {
  return new Promise((resolve, reject) => {
    const messageNonce = nonce++;
    window.postMessage({
      target: 'injected-contentscript',
      message,
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
