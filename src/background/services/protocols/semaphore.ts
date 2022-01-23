import { Semaphore, MerkleProof, FullProof, genSignalHash, generateMerkleProof } from '@zk-kit/protocols'
import { ZkIdentity } from '@zk-kit/identity'
import { bigintToHex, hexToBigint } from 'bigint-conversion'
import axios, { AxiosResponse } from 'axios'
import { ISafeProof, ISemaphoreProofRequest } from './interfaces'
import { deserializeMerkleProof } from './utils'
import { MerkleProofArtifacts } from '@src/types'

export default class SemaphoreService {
    // eslint-disable-next-line class-methods-use-this
    async genProof(identity: ZkIdentity, request: ISemaphoreProofRequest): Promise<ISafeProof> {
        try {
        const {
            circuitFilePath,
            zkeyFilePath,
            merkleStorageAddress,
            externalNullifier,
            signal,
            merkleProofArtifacts,
        } = request
        let merkleProof: MerkleProof;
        const identityCommitment = identity.genIdentityCommitment();
        if (merkleStorageAddress) {
            const response: AxiosResponse = await axios.post(merkleStorageAddress, {
                identityCommitment: bigintToHex(identityCommitment)
            })

            merkleProof = deserializeMerkleProof(response.data.merkleProof)
        } else {
            let proofArtifacts = (merkleProofArtifacts as MerkleProofArtifacts);

            let leaves = proofArtifacts.leaves.map(leaf => hexToBigint(leaf));
            merkleProof = generateMerkleProof(proofArtifacts.depth, BigInt(0), proofArtifacts.leavesPerNode, leaves, identityCommitment)

        }

        const witness = Semaphore.genWitness(
            identity.getTrapdoor(), 
            identity.getNullifier(), 
            merkleProof, 
            externalNullifier, 
            signal
        )

        const fullProof: FullProof = await Semaphore.genProof(witness, circuitFilePath, zkeyFilePath)
        const solidityProof = Semaphore.packToSolidityProof(fullProof)

        const nullifierHash: bigint = Semaphore.genNullifierHash(externalNullifier, identity.getNullifier())
        const publicSignals: Array<string> = [
            bigintToHex(merkleProof.root),
            bigintToHex(nullifierHash),
            bigintToHex(genSignalHash(signal)),
            externalNullifier
        ]


        return {
            fullProof,
            solidityProof,
            publicSignals
        }
    } catch(e) {
        throw new Error(`Error while generating semaphore proof: ${e}`);
    }
    }
}
