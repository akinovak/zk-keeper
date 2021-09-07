import {browser, WebRequest} from "webextension-polyfill-ts";
import {MessageAction} from "@src/util/postMessage";
import {AppService} from "@src/util/svc";
import controllers from "@src/background/controllers";
import Main from "@src/background/services/main-service";
import Other from "@src/background/services/other-service";

(async function() {
    let app: AppService;

    browser.runtime.onMessage.addListener(async (request: any, sender: any) => {
        await waitForStartApp();

        try {
            const res = await handleMessage(app, request);
            return [null, res];
        } catch (e: any) {
            return [e.message, null];
        }
    });

    const startedApp = new AppService();
    startedApp.add('main', new Main());
    startedApp.add('other', new Other());
    await startedApp.start();
    app = startedApp;

    async function waitForStartApp() {
        return new Promise((resolve) => {
           if (app) {
               resolve(true);
               return;
           }

           setTimeout(async () => {
               await waitForStartApp();
               resolve(true);
           }, 500);
        });
    }
})();

function handleMessage(app: AppService, message: MessageAction) {
    const controller = controllers[message.type];

    if (controller) {
        return controller(app, message);
    }
}


