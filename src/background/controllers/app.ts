import Handler from "./handler";
import LockService from "../services/lock";
import IdentityService from "../services/identity";
import MetamaskService from "../services/metamask";
import { ZkIdentity } from "@libsem/identity";
import { RPCAction } from "@src/util/constants";
import { FinalizedRequest, NewIdentityRequest, WalletInfo, ZkInputs } from "../interfaces";
import * as interrep from "../../util/interrep";
import Web3 from "web3";
import ZkValidator from "../services/whitelisted";
import RequestManager from "./request-manager";
import SemaphoreService from "../services/protocols/semaphore";
import { ISafeProof, ISemaphoreProofRequest } from "../services/protocols/interfaces";

const PROOF = 'proof';
const DUMMY = 'dummy';

export default class App extends Handler {
    private identityService: IdentityService;
    private metamaskService: MetamaskService;
    private zkValidator: ZkValidator;
    private requestManager: RequestManager;
    private semaphoreService: SemaphoreService;
    constructor() {
        super();
        this.identityService = new IdentityService();
        this.metamaskService = new MetamaskService();
        this.zkValidator = new ZkValidator();
        this.requestManager = new RequestManager();
        this.semaphoreService = new SemaphoreService();
    }

    initialize = async (): Promise<App> => {
        this.add('unlock', LockService.unlock, this.metamaskService.ensure, this.identityService.unlock);
        this.add('logout', LockService.logout);

        this.add(RPCAction.CONNECT_METAMASK, LockService.ensure, this.metamaskService.connectMetamask);

        this.add(RPCAction.CREATE_IDENTITY, LockService.ensure, this.metamaskService.ensure, async (payload: NewIdentityRequest) => {
            //TODO wrapp this in try catch if something wrong happens on metamask side
            const { id: providerId } = payload;
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
                    sign: (message: string) => web3.eth.sign(message, walletInfo?.account),
                    account: walletInfo?.account,
                });
            } else if (providerId === 'random') {
                identity = new ZkIdentity();
            } else {
                throw new Error(`Provider: ${providerId} is not supported`);
            }

            console.log('Debug: Identity is created: ', identity);
            await this.identityService.addIdentity(identity);
            return true;
        });

        this.add(RPCAction.GET_COMMITMENTS, LockService.ensure, this.identityService.getIdentityCommitments);

        this.add(RPCAction.GET_PENDING_REQUESTS, LockService.ensure, this.requestManager.getRequests);
        this.add(RPCAction.FINALIZE_REQUEST, LockService.ensure, this.requestManager.finalizeRequest);
        this.add(RPCAction.GET_WALLET_INFO, this.metamaskService.getWalletInfo);
        //For testing purposes
        this.add(RPCAction.DUMMY_REQUEST, async () => {
            return this.requestManager.newRequest('hello from dummy', DUMMY);
        });

        this.add(RPCAction.SEMAPHORE_PROOF, LockService.ensure, this.zkValidator.validateZkInputs, async (payload: ISemaphoreProofRequest) => {
            const identity: ZkIdentity | undefined = await this.identityService.getActiveidentity();
            if(!identity) throw new Error("active identity not found");

            const safeProof: ISafeProof = await this.semaphoreService.genProof(identity, payload);
            return this.requestManager.newRequest(JSON.stringify(safeProof), PROOF);
        })

        return this;
    }

}