import {GenericService} from "@src/util/svc";
import pushMessage from "@src/util/pushMessage";
import { setIdentity, IBuiltTreeData } from "@src/ui/ducks/app";
import { get, set } from '@src/background/services/storage';

import { FastSemaphore, OrdinarySemaphore, RLN, Identity, IProof, IWitnessData }from 'semaphore-lib';

// set all hashers to poseidon by default
FastSemaphore.setHasher('poseidon');
OrdinarySemaphore.setHasher('poseidon');
RLN.setHasher('poseidon');

export default class Semaphore extends GenericService {

    private identity: Identity | null;
    private identityCommitment: any;

    constructor() {
        super();
        this.identity = null;
    }

    start = async () => {
        const fetchedIdentity: string | null = await get('identity');
        if(fetchedIdentity) {
            this.identity = FastSemaphore.unSerializeIdentity(fetchedIdentity);
            this.identityCommitment = FastSemaphore.genIdentityCommitment(this.identity);
        } else {
            console.log('identity not found');
            this.identity = FastSemaphore.genIdentity();
            this.identityCommitment = FastSemaphore.genIdentityCommitment(this.identity);
            set('identity', FastSemaphore.serializeIdentity(this.identity));
        }
    }

    get = async () => {
        console.log('commitment:', this.identityCommitment);
        return this.identityCommitment.toString();
    };

    genProofFromBuiltTree = async (payload: IBuiltTreeData): Promise<any> => {
        if(!this.identity) return 'No identity';
        const { merkleProof, externalNullifier, signal, wasmFilePath, finalZkeyPath } = payload;
        return FastSemaphore.genProofFromBuiltTree(this.identity, merkleProof, externalNullifier, signal, wasmFilePath, finalZkeyPath);
    }
}