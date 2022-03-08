import { browser } from 'webextension-polyfill-ts';
import {ActionType} from "@src/ui/ducks/identities";

(async function () {
    try {
    const url = browser.runtime.getURL('js/injected.js')
    const container = document.head || document.documentElement
    const scriptTag = document.createElement('script')
    scriptTag.src = url
    scriptTag.setAttribute('async', 'false')
    container.insertBefore(scriptTag, container.children[0])
    container.removeChild(scriptTag)

    window.addEventListener('message', async (event) => {
        const { data } = event
        if (data && data.target === 'injected-contentscript') {
            const res = await browser.runtime.sendMessage(data.message)
            window.postMessage(
                {
                    target: 'injected-injectedscript',
                    payload: res,
                    nonce: data.nonce
                },
                '*'
            )
        }
    });

    browser.runtime.onMessage.addListener((action) => {
       switch (action.type) {
           case ActionType.SET_SELECTED:
               window.postMessage({
                   target: 'injected-injectedscript',
                   payload: [null, action.payload],
                   nonce: 'identityChanged',
               }, '*');
               return;
       }
    });
  } catch(e) {
      console.error("error occured", e);
  }
})()
