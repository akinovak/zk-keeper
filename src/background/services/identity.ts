import {GenericService} from "@src/util/svc";
import {get, set} from "@src/background/services/storage";
import {FullIdentity} from "@src/util/idTypes";
import * as interrep from "@src/util/idTypes/interrep";
import deepEqual from "fast-deep-equal";
import pushMessage from "@src/util/pushMessage";
import {setIdentities, setIdentityRequestPending} from "@src/ui/ducks/identities";

const DB_KEY = '@@identities@@';

export default class Identity extends GenericService {
    identities: FullIdentity[];
    requestPending: boolean;

    constructor() {
        super();
        this.identities = [];
        this.requestPending = false;
    }

    refreshIdentities = async () => {
        const content = await get(DB_KEY);
        this.identities = Object.entries(content || {}).map(([key, value]) => value as FullIdentity);
    }

    getRequestPendingStatus = async () => {
        return this.requestPending;
    }

    getIdentities = async (dangerous = false) => {
        await this.refreshIdentities();
        if (dangerous) return this.identities;
        return this.identities.map(({ data, hasher, idProvider, type }) => ({
            data,
            hasher,
            idProvider,
            type,
        }));
    }

    requestIdentities = async () => {
        this.requestPending = true;
        return pushMessage(setIdentityRequestPending(true));
    }

    confirmRequest = async () => {
        const identities = await this.getIdentities();
        this.emit('accepted', identities);
        this.requestPending = false;
        return pushMessage(setIdentityRequestPending(false));
    }

    rejectRequest = async () => {
        this.emit('rejected');
        this.requestPending = false;
        return pushMessage(setIdentityRequestPending(false));
    }

    addIdentity = async (newIdentity: FullIdentity) => {
        const existing = await this.getIdentities();

        for (const identity of existing) {
            if (deepEqual(identity, newIdentity)) {
                return;
            }
        }

        const newIdentities = [...existing, newIdentity];

        await pushMessage(setIdentities(newIdentities));

        return set(DB_KEY, newIdentities);
    }

    createIdentity = async (providerId: string, option: interrep.CreateIdentityOption) => {
        const web3 = await this.exec('metamask', 'getWeb3');
        const data = await this.exec('metamask', 'getWalletInfo');
        let identity: FullIdentity;

        switch (providerId) {
            case interrep.providerId:
                identity = await interrep.createIdentity({
                    ...option,
                    sign: (message: string) => web3.eth.personal.sign(message, data?.account),
                    account: data?.account,
                });

                await this.addIdentity(identity);
                return identity;
            default:
                throw new Error(`unknown providerId - ${providerId}`);
        }
    }

    async start() {
        this.refreshIdentities();
    }
}