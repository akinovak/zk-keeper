import {GenericService} from "@src/util/svc";
import pushMessage from "@src/util/pushMessage";
import createMetaMaskProvider from "@dimensiondev/metamask-extension-provider";
import Web3 from "web3";
import {setAccount, setWeb3Connecting} from "@src/ui/ducks/web3";

export default class Metamask extends GenericService {
    provider?: any;
    web3?: Web3;

    loadProvider = async () => {
        if (!this.provider) {
            this.provider = await createMetaMaskProvider();
        }

        if (this.provider) {
            this.web3 = new Web3(this.provider);
        }
    }

    getWalletInfo = async () => {
        if (!this.web3) {
            return null;
        }

        if (this.provider?.selectedAddress) {
            const accounts = await this.web3.eth.requestAccounts();

            if (!accounts.length) {
                throw new Error('No accounts found');
            }

            return {
                account: accounts[0],
            };
        }

        return null;
    }

    connectMetamask = async () => {
        await pushMessage(setWeb3Connecting(true));

        try {
            await this.loadProvider();

            if (this.web3) {
                const accounts = await this.web3.eth.requestAccounts();

                if (!accounts.length) {
                    throw new Error('No accounts found');
                }

                await pushMessage(setAccount(accounts[0]));
            }

            await pushMessage(setWeb3Connecting(false));
        } catch (e) {
            await pushMessage(setWeb3Connecting(false));
            throw e;
        }
    }

    start = async () => {
        try {
            await this.loadProvider();
        } catch (e) {
            console.error(e);
        }
    }
}