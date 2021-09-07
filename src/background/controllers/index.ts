import {AppService} from "@src/util/svc";
import {MessageAction} from "@src/util/postMessage";
import {browser} from "webextension-polyfill-ts";

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

  SET_APP_TEXT: async (app, message) => {
    console.log(message);
    return app.exec('main', 'setAppText', message.payload);
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
