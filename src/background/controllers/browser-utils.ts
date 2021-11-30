import { browser } from "webextension-polyfill-ts";

export default class BrowserUtils {

    createTab = async (options: any) => {
        return browser.tabs.create(options);
    }

    createWindow = async (options: any) => {
        return browser.windows.create(options);
    }

    openPopup = async () => {
        const tab = await this.createTab({ url: 'popup.html', active: false });

        //TODO add this in config/constants...
        const popup = await this.createWindow({
            tabId: tab.id,
            type: 'popup',
            focused: true,
            width: 357,
            height: 600,
        })
    }
}