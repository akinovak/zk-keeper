import {AppService} from "@src/util/svc";
import {MessageAction} from "@src/util/postMessage";
import {browser} from "webextension-polyfill-ts";
import {RPCAction} from "@src/util/constants";

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

      resolve(true);
    })
  },

  [RPCAction.CONNECT_METAMASK]: async (app, message) => {
    return app.exec('metamask', 'connectMetamask');
  },

  [RPCAction.GET_WALLET_INFO]: async (app, message) => {
    return app.exec('metamask', 'getWalletInfo');
  },

  [RPCAction.GET_IDENTITIES]: async (app, message) => {
    return app.exec('identity', 'getIdentities');
  },

  [RPCAction.GET_REQUEST_PENDING_STATUS]: async (app, message) => {
    return app.exec('identity', 'getRequestPendingStatus');
  },

  [RPCAction.REQUEST_IDENTITIES]: async (app, message) => {
    return new Promise(async (resolve, reject) => {
      try {
        await app.exec('identity', 'requestIdentities');
        const popup = await openPopup();
        return closePopupOnAcceptOrReject(app, resolve, reject, popup);
      } catch (e) {
        reject(e);
      }
    });
  },

  [RPCAction.CONFIRM_REQUEST]: async (app, message) => {
    console.log('hi')
    return app.exec('identity', 'confirmRequest');
  },

  [RPCAction.REJECT_REQUEST]: async (app, message) => {
    return app.exec('identity', 'rejectRequest');
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
  app.on('identity.accepted', (returnIdentities) => {
    console.log(returnIdentities);
    resolve(returnIdentities);
    browser.windows.remove(popup.id as number);
  });

  app.on('identity.rejected', () => {
    reject(new Error('user rejected.'));
    browser.windows.remove(popup.id as number);
  });
}
