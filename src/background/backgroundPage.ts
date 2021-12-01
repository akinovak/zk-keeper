import { browser } from "webextension-polyfill-ts";
import LockService from './services/lock';
import App from './controllers/app';
import { IRequest } from "./interfaces";

//TODO consider adding inTest env

const app: App = new App();

app.initialize()
.then(async (app: App) => {
    browser.runtime.onMessage.addListener(async (request: IRequest, _) => {
        try {
            const res = await app.handle(request);
            return [null, res];
        } catch (e: any) {
            return [e.message, null];
        }
    })
});

browser.runtime.onInstalled.addListener(async ({ reason }) => {
  console.log('Reason: ', reason);
  if(reason === 'install') {
    //TODO open html where password will be interested
    // browser.tabs.create({
    //   url: 'popup.html'
    // });

    await LockService.setupPassword('password123');
  }
    /**
     * TODO: This is necessary before proper password flow is implemented
     */
  await LockService.setupPassword('password123');
});


