import {GenericService} from "@src/util/svc";
import {get, set} from "@src/background/services/storage";
import {ZkIdentity} from "@libsem/identity";
import * as interrep from "@src/util/interrep";
import { bigintToHex } from "bigint-conversion";

const DB_KEY = '@@identities@@';

export default class Identity extends GenericService {
    identities: Map<string, ZkIdentity>;
    activeIdentity?: ZkIdentity;

    constructor() {
        super();
        this.identities = new Map();
        this.activeIdentity = undefined;
    }

    fetchIdentities = async () => {
        const content = await get(DB_KEY);
        Object.entries(content || {}).map(([_, value]) => {
            const identity: ZkIdentity = ZkIdentity.genFromSerialized(value as string);
            const identityCommitment: bigint = identity.genIdentityCommitment();
            this.identities.set(bigintToHex(identityCommitment), identity);
        })
    }

    setDefaultIdentity = async () => {
        if(!this.identities.size) {
            await this.fetchIdentities();
        }

        // if no identities, map will be empty again
        if(!this.identities.size) return;

        const firstKey: string = this.identities.keys().next().value;
        this.activeIdentity = this.identities.get(firstKey);
    }

    setActiveIdentity = async (identityCommitment: string) => {
        await this.fetchIdentities();

        if(this.identities.has(identityCommitment)) {
            this.activeIdentity = this.identities.get(identityCommitment);
            console.log('Active identity set');
        }
    }

    getActiveidentity = async (): Promise<ZkIdentity | undefined> => {
        return this.activeIdentity;
    }

    getIdentityCommitments = async () => {
        await this.fetchIdentities();
        const commitments: string[] = [];
        for (let key of this.identities.keys()) {
            commitments.push(key);
        }
        return commitments;
    }

    addIdentity = async (newIdentity: ZkIdentity): Promise<boolean> => {
        await this.fetchIdentities();

        const identityCommitment: string = bigintToHex(newIdentity.genIdentityCommitment());
        const existing: boolean = this.identities.has(identityCommitment);

        if(!existing) return false;

        const existingIdentites: string[] = [];
        for (let identity of this.identities.values()) {
            existingIdentites.push(identity.serializeIdentity());
        }

        await set(DB_KEY, [newIdentity.serializeIdentity(), ...existingIdentites]);
        await this.fetchIdentities();
        return true;
    }

    createIdentity = async (providerId: string, option: interrep.CreateIdentityOption): Promise<string> => {
        try {
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

                    const added = await this.addIdentity(identity);
                    if(added) return "Identity successfully added";
                    else return "Identity already exists";
                default:
                    throw new Error(`unknown providerId - ${providerId}`);
            }
        } catch(error) { 
            throw new Error('Unknown error occurred');
        }
    }

    async start() {
        await this.fetchIdentities();
        await this.setDefaultIdentity();
        console.log(this.identities);
    }
}