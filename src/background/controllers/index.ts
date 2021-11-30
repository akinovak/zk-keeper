import {AppService} from "@src/util/svc";
import {MessageAction} from "@src/util/postMessage";
import {browser} from "webextension-polyfill-ts";
import {RPCAction} from "@src/util/constants";
import { ZkIdentity } from "@libsem/identity";
import { ISafeProof, ISemaphoreProofRequest } from "../services/protocols/interfaces";
import { validCircuit, validZkey, validMerkleStorage } from "../services/whitelisted";

// let isUnlocked: boolean = false;

const controllers: {
  [type: string]: (app: AppService, message: MessageAction) => Promise<any>;
} = {

  OPEN_POPUP: async (app, message) => {
    return new Promise(async (resolve, reject) => {
      const popup = await openPopup();

      const onPopUpClose = (windowId: number) => {
        if (windowId === popup.id) {
          reject(new Error('user rejected.'));
          browser.windows.onRemoved.removeListener(onPopUpClose);
        }
      };

      browser.windows.onRemoved.addListener(onPopUpClose);

      resolve(popup);
    })
  },

  [RPCAction.CONNECT_METAMASK]: async (app, message) => {
    return app.exec('metamask', 'connectMetamask');
  },

  [RPCAction.GET_WALLET_INFO]: async (app, message) => {
    return app.exec('metamask', 'getWalletInfo');
  },

  [RPCAction.GET_COMMITMENTS]: async (app, message) => {
    return app.exec('identity', 'getIdentityCommitments');
  },

  [RPCAction.SET_ACTIVE_IDENTITY]: async (app, message) => {
    const { identityCommitment }: { identityCommitment: string } = message.payload;
    return app.exec('identity', 'setActiveIdentity', identityCommitment);
  },

  // [RPCAction.GET_REQUEST_PENDING_STATUS]: async (app, message) => {
  //   return app.exec('identity', 'getRequestPendingStatus');
  // },

  // [RPCAction.REQUEST_IDENTITIES]: async (app, message) => {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       await app.exec('identity', 'requestIdentities');
  //       const popup = await openPopup();
  //       return closePopupOnAcceptOrReject(app, resolve, reject, popup);
  //     } catch (e) {
  //       reject(e);
  //     }
  //   });
  // },

  // [RPCAction.CONFIRM_REQUEST]: async (app, message) => {
  //   console.log('hi')
  //   return app.exec('identity', 'confirmRequest');
  // },

  // [RPCAction.REJECT_REQUEST]: async (app, message) => {
  //   return app.exec('identity', 'rejectRequest');
  // },

  //TODO add confirmation popup
  [RPCAction.SEMAPHORE_PROOF]: async (app, message) => {
    const request: ISemaphoreProofRequest = message.payload;
    
    const { circuitFilePath, zkeyFilePath, merkleServiceAddress } = request;

    if(!validCircuit(circuitFilePath)) throw new Error("circuipt path is not trusted");
    if(!validZkey(zkeyFilePath)) throw new Error("zkey path is not trusted");
    if(!validMerkleStorage(merkleServiceAddress)) throw new Error("merkle service is not trusted");

    const activeIdentity: ZkIdentity | undefined = await app.exec('identity', 'getActiveidentity');

    if(!activeIdentity) throw new Error("active identity not detected");

    const safeProof: ISafeProof = await app.exec('semaphore', 'genProof',
      activeIdentity,
      request
    );

    return JSON.stringify(safeProof);
  },

  [RPCAction.CREATE_IDENTITY]: async (app, message) => {
    return app.exec(
      'identity',
      'createIdentity',
      message.payload.id,
      message.payload.option,
    );
  },
};

export default controllers;

async function openPopup() {

  const tab = await browser.tabs.create({
    url: browser.extension.getURL('popup.html'),
    active: false,
  });

  const popup = await browser.windows.create({
    tabId: tab.id,
    type: 'popup',
    focused: true,
    width: 357,
    height: 600,
  });

  return popup;
}

function closePopupOnAcceptOrReject(
    app: AppService,
    resolve: (data: any) => void,
    reject: (err: Error) => void,
    popup: any,
) {
  app.on('semaphore.accepted', (safeproof) => {
    console.log(safeproof);
    resolve(safeproof);
    browser.windows.remove(popup.id as number);
  });

  app.on('semaphore.rejected', () => {
    reject(new Error('user rejected.'));
    browser.windows.remove(popup.id as number);
  });
}
