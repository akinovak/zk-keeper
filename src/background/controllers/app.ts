import Handler from "./handler";
import LockService from "../services/lock";
import IdentityService from "../services/identity";
import MetamaskService from "../services/metamask";
import { ZkIdentity } from "@libsem/identity";
import { RPCAction } from "@src/util/constants";
import { NewIdentityRequest, WalletInfo } from "../interfaces";
import * as interrep from "../../util/interrep";
import Web3 from "web3";

export default class App extends Handler {
    private identityService: IdentityService;
    private metamaskService: MetamaskService;
    constructor() {
        super();
        this.identityService = new IdentityService();
        this.metamaskService = new MetamaskService();
    }

    initialize = async (): Promise<App> => {
        this.add('unlock', LockService.unlock, this.metamaskService.ensure, this.identityService.unlock);
        this.add('logout', LockService.logout);

        this.add(RPCAction.CONNECT_METAMASK, LockService.ensure, this.metamaskService.connectMetamask);

        this.add(RPCAction.CREATE_IDENTITY, LockService.ensure, this.metamaskService.ensure, async (payload: NewIdentityRequest) => {
            const { providerId } = payload;
            if(!providerId) throw new Error("Provider required");

            const web3: Web3 = await this.metamaskService.getWeb3();
            const walletInfo: WalletInfo | null = await this.metamaskService.getWalletInfo();

            if(!web3) throw new Error("Web3 not found");
            if(!walletInfo) throw new Error("Wallet info not fould");

            let identity: ZkIdentity;

            if(providerId === interrep.providerId) {
                const { option } = payload;
                identity = await interrep.createIdentity({
                    ...option,
                    sign: (message: string) => web3.eth.personal.sign(message, walletInfo?.account, "remove"),
                    account: walletInfo?.account,
                });

            } else {
                throw new Error(`Provider: ${providerId} is not supported`);
            }

            // await this.identityService.add
        });


        this.add(RPCAction.GET_COMMITMENTS, LockService.ensure, this.identityService.getIdentityCommitments);
        return this;
    }

}