import {GenericService} from "@src/util/svc";
import {get, set} from "@src/background/services/storage";
import {ZkIdentity} from "@libsem/identity";
import * as interrep from "@src/util/interrep";
import deepEqual from "fast-deep-equal";
import pushMessage from "@src/util/pushMessage";
import {setIdentities, setIdentityRequestPending} from "@src/ui/ducks/identities";

const DB_KEY = '@@identities@@';

export default class Identity extends GenericService {
    identities: ZkIdentity[];
    requestPending: boolean;

    constructor() {
        super();
        this.identities = [];
        this.requestPending = false;
    }

    refreshIdentities = async () => {
        const content = await get(DB_KEY);
        this.identities = Object.entries(content || {}).map(([key, value]) => {
            return ZkIdentity.genFromSerialized(value as string);
        })
    }

    getRequestPendingStatus = async () => {
        return this.requestPending;
    }

    getIdentities = async () => {
        await this.refreshIdentities();
        return this.identities;
        // await this.refreshIdentities();
        // if (dangerous) return this.identities;
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

    addIdentity = async (newIdentity: ZkIdentity) => {
        const existing = await this.getIdentities();
        for (const identity of existing) {
            if (deepEqual(identity, newIdentity)) {
                return;
            }
        }

        const newIdentities: Array<string> = existing.map((identity: ZkIdentity) => {
            return identity.serializeIdentity();
        });

        newIdentities.push(newIdentity.serializeIdentity());
        await pushMessage(setIdentities(newIdentities));
        return set(DB_KEY, newIdentities);
    }

    createIdentity = async (providerId: string, option: interrep.CreateIdentityOption): Promise<ZkIdentity> => {
        const web3 = await this.exec('metamask', 'getWeb3');
        const data = await this.exec('metamask', 'getWalletInfo');
        let identity: ZkIdentity;

        switch (providerId) {
            case interrep.providerId:
                identity = await interrep.createIdentity({
                    ...option,
                    sign: (message: string) => web3.eth.personal.sign(message, data?.account),
                    account: data?.account,
                });

                console.log(identity);

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