import { browser } from 'webextension-polyfill-ts'
import LockService from './services/lock'
import ZkKepperController from './zk-kepeer'
import { Request } from '@src/types'

//TODO consider adding inTest env
const app: ZkKepperController = new ZkKepperController()

app.initialize().then(async (app: ZkKepperController) => {
    browser.runtime.onMessage.addListener(async (request: Request, _) => {
        try {
            const res = await app.handle(request)
            return [null, res]
        } catch (e: any) {
            return [e.message, null]
        }
    })
})

browser.runtime.onInstalled.addListener(async ({ reason }) => {
    console.log('Reason: ', reason)
    if (reason === 'install') {
        //TODO open html where password will be interested
        // browser.tabs.create({
        //   url: 'popup.html'
        // });

        await LockService.setupPassword('password123')
    }
    /**
     * TODO: This is necessary before proper password flow is implemented
     */
    await LockService.setupPassword('password123')
})
