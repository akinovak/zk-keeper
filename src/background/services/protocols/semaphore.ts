import { Semaphore, MerkleProof, SemaphoreFullProof, SemaphoreSolidityProof, SemaphorePublicSignals, genSignalHash, generateMerkleProof } from '@zk-kit/protocols'
import { ZkIdentity } from '@zk-kit/identity'
import { bigintToHex, hexToBigint } from 'bigint-conversion'
import axios, { AxiosResponse } from 'axios'
import { SemaphoreProof, SemaphoreProofRequest } from './interfaces'
import { deserializeMerkleProof } from './utils'
import { MerkleProofArtifacts } from '@src/types'

export default class SemaphoreService {
    // eslint-disable-next-line class-methods-use-this
    async genProof(identity: ZkIdentity, request: SemaphoreProofRequest): Promise<SemaphoreProof> {
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
        const identityCommitmentHex = bigintToHex(identityCommitment);
        if (merkleStorageAddress) {
            const response: AxiosResponse = await axios.post(merkleStorageAddress, {
                identityCommitment: identityCommitmentHex
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

        const fullProof: SemaphoreFullProof = await Semaphore.genProof(witness, circuitFilePath, zkeyFilePath)

        const solidityProof: SemaphoreSolidityProof = Semaphore.packToSolidityProof(fullProof)

        return {
            fullProof,
            solidityProof
        }
    } catch(e) {
        throw new Error(`Error while generating semaphore proof: ${e}`);
    }
    }
}
