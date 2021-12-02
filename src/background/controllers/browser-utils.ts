import { browser } from 'webextension-polyfill-ts'

class BrowserUtils {
    createTab = async (options: any) => {
        return browser.tabs.create(options)
    }

    createWindow = async (options: any) => {
        return browser.windows.create(options)
    }

    openPopup = async () => {
        const tab = await this.createTab({ url: 'popup.html', active: false })

        //TODO add this in config/constants...
        const popup = await this.createWindow({
            tabId: tab.id,
            type: 'popup',
            focused: true,
            width: 357,
            height: 600
        })

        return popup
    }

    focusWindow = (windowId) => {
        return browser.windows.update(windowId, { focused: true })
    }

    getAllWindows = () => {
        return browser.windows.getAll()
    }
}

export default new BrowserUtils()
