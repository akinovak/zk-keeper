import {ZkIdentity} from "@libsem/identity";
import { bigintToHex } from "bigint-conversion";
import SimpleStorage from "./simple-storage";
import LockService from "./lock";

const DB_KEY = '@@identities@@';

export default class IdentityService extends SimpleStorage {
    identities: Map<string, ZkIdentity>;
    activeIdentity?: ZkIdentity;

    constructor() {
        super(DB_KEY);
        this.identities = new Map();
        this.activeIdentity = undefined;
    }

    unlock = async (_: any) => {
        const encryptedContent = await this.get();
        if(!encryptedContent) return true;

        const decrypted: any = LockService.decrypt(encryptedContent);
        await this.setInMemory(decrypted);
        await this.setDefaultIdentity();
        return true;
    }

    setInMemory = async (decrypted: any) => {
        Object.entries(decrypted || {}).map(([_, value]) => {
            const identity: ZkIdentity = ZkIdentity.genFromSerialized(value as string);
            const identityCommitment: bigint = identity.genIdentityCommitment();
            this.identities.set(bigintToHex(identityCommitment), identity);
        })
    }

    setDefaultIdentity = async () => {
        if(!this.identities.size) return;

        const firstKey: string = this.identities.keys().next().value;
        this.activeIdentity = this.identities.get(firstKey);
    }

    setActiveIdentity = async (identityCommitment: string) => {
        if(this.identities.has(identityCommitment)) {
            this.activeIdentity = this.identities.get(identityCommitment);
            console.log('Active identity set');
        }
    }

    getActiveidentity = async (): Promise<ZkIdentity | undefined> => {
        return this.activeIdentity;
    }

    getIdentityCommitments = async () => {
        const commitments: string[] = [];
        for (let key of this.identities.keys()) {
            commitments.push(key);
        }
        return commitments;
    }

    addIdentity = async (newIdentity: ZkIdentity): Promise<boolean> => {
        const identityCommitment: string = bigintToHex(newIdentity.genIdentityCommitment());
        const existing: boolean = this.identities.has(identityCommitment);

        if(!existing) return false;

        const existingIdentites: string[] = [];
        for (let identity of this.identities.values()) {
            existingIdentites.push(identity.serializeIdentity());
        }

        const newValue: string[] = [...existingIdentites, newIdentity.serializeIdentity()]
        const ciphertext = LockService.encrypt(JSON.stringify(newValue));
        await this.set(ciphertext);

        this.identities.set(identityCommitment, newIdentity);
        return true;
    }
}