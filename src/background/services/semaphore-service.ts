import {GenericService} from "@src/util/svc";
import pushMessage from "@src/util/pushMessage";
import { setIdentity, IBuiltTreeData } from "@src/ui/ducks/app";
import { get, set } from '@src/background/services/storage';

import { FastSemaphore, OrdinarySemaphore, RLN, Identity, IProof, IWitnessData }from 'semaphore-lib';
import * as bigintConversion from 'bigint-conversion';

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
        console.log('In semaphore proof');
        const { merkleProof, externalNullifier, signal, wasmFilePath, finalZkeyPath } = payload;

        merkleProof.leaf = bigintConversion.hexToBigint(merkleProof.leaf);

        merkleProof.pathElements = merkleProof.pathElements.map((path) => {
            return path.map((elem) => { console.log(elem); return bigintConversion.hexToBigint(elem) })
        })

        const proof: IProof = await FastSemaphore.genProofFromBuiltTree(this.identity, merkleProof, externalNullifier, signal, wasmFilePath, finalZkeyPath);
        console.log('managed to create proof', proof.proof);
        return proof.proof;
    }
}