import {GenericService} from "@src/util/svc";
import pushMessage from "@src/util/pushMessage";
import createMetaMaskProvider from "@dimensiondev/metamask-extension-provider";
import Web3 from "web3";
import {setAccount, setNetwork, setWeb3Connecting} from "@src/ui/ducks/web3";

export default class Metamask extends GenericService {
    provider?: any;
    web3?: Web3;

    ensure = async () => {
        if (!this.provider) {
            this.provider = await createMetaMaskProvider();
        }

        if (this.provider) {
            if (!this.web3) {
                this.web3 = new Web3(this.provider);
            }

            this.provider.on('accountsChanged', ([account]) => {
                pushMessage(setAccount(account));
            });

            this.provider.on('chainChanged', async () => {
                const networkType = await this.web3?.eth.net.getNetworkType();
                pushMessage(setNetwork(networkType as string));
            });
        }
    }

    getWeb3 = async (): Promise<Web3> => {
        if (!this.web3) throw new Error(`web3 is not initialized`);
        return this.web3;
    }

    getWalletInfo = async () => {
        await this.ensure();

        if (!this.web3) {
            return null;
        }

        if (this.provider?.selectedAddress) {
            const accounts = await this.web3.eth.requestAccounts();
            const networkType = await this.web3.eth.net.getNetworkType();

            if (!accounts.length) {
                throw new Error('No accounts found');
            }

            return {
                account: accounts[0],
                networkType: networkType,
            };
        }

        return null;
    }

    connectMetamask = async () => {
        await pushMessage(setWeb3Connecting(true));

        try {
            await this.ensure();

            if (this.web3) {
                const accounts = await this.web3.eth.requestAccounts();
                const networkType = await this.web3.eth.net.getNetworkType();

                if (!accounts.length) {
                    throw new Error('No accounts found');
                }

                await pushMessage(setAccount(accounts[0]));
                await pushMessage(setNetwork(networkType));
            }

            await pushMessage(setWeb3Connecting(false));
        } catch (e) {
            await pushMessage(setWeb3Connecting(false));
            throw e;
        }
    }

    start = async () => {
        this.ensure();
    }
}