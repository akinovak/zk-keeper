import pushMessage from '@src/util/pushMessage'
import { EventEmitter2 } from 'eventemitter2'
import { FinalizedRequest, PendingRequest, PendingRequestType, RequestResolutionAction } from '@src/types'
import { setPendingRequest } from '@src/ui/ducks/requests'
import BrowserUtils from './browser-utils'
import {browser} from "webextension-polyfill-ts";

let nonce = 0

export default class RequestManager extends EventEmitter2 {
    private pendingRequests: Array<PendingRequest>

    constructor() {
        super()
        this.pendingRequests = []
    }

    getRequests = (): PendingRequest[] => this.pendingRequests

    finalizeRequest = async (payload: FinalizedRequest): Promise<boolean> => {
        const { id, action } = payload
        if (!id) throw new Error('id not provided')
        if (!action) throw new Error('action is not provided')
        // TODO add some mutex lock just in case something strange occurs
        this.pendingRequests = this.pendingRequests.filter((pendingRequest: PendingRequest) => pendingRequest.id !== id)
        this.emit(`${id}:finalized`, action)
        await pushMessage(setPendingRequest(this.pendingRequests))
        return true
    }

    addToQueue = async (type: PendingRequestType, payload?: any): Promise<string> => {
        // eslint-disable-next-line no-plusplus
        const id: string = `${nonce++}`
        this.pendingRequests.push({ id, type, payload })
        await pushMessage(setPendingRequest(this.pendingRequests))
        return id
    }

    newRequest = async (data: any, type: PendingRequestType, payload?: any) => {
        const id: string = await this.addToQueue(type, payload)
        const popup = await BrowserUtils.openPopup()

        return new Promise((resolve, reject) => {
            const onPopupClose = (windowId: number) => {
                if (windowId === popup.id) {
                    reject(new Error('user rejected.'));
                    browser.windows.onRemoved.removeListener(onPopupClose);
                }
            }

            browser.windows.onRemoved.addListener(onPopupClose);

            this.once(`${id}:finalized`, (action: RequestResolutionAction) => {
                browser.windows.onRemoved.removeListener(onPopupClose);
                switch (action) {
                    case 'accept':
                        resolve(data)
                        return
                    case 'reject':
                        // eslint-disable-next-line prefer-promise-reject-errors
                        reject(new Error('user rejected.'))
                        return
                    default:
                        throw new Error(`action: ${action} not supproted`)
                }
            })
        })
    }

    handlePopup = async () => {
        const newPopup = await BrowserUtils.openPopup()
        if (!newPopup?.id) throw new Error('Something went wrong in opening popup')
    }
}
