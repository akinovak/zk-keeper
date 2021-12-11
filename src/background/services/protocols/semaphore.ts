import { Semaphore, MerkleProof, FullProof, genSignalHash } from '@libsem/protocols'
import { ZkIdentity } from '@libsem/identity'
import { bigintToHex } from 'bigint-conversion'
import axios, { AxiosResponse } from 'axios'
import { ISafeProof, ISemaphoreProofRequest } from './interfaces'
import { deserializeMerkleProof } from './utils'

export default class SemaphoreService {
    // eslint-disable-next-line class-methods-use-this
    async genProof(identity: ZkIdentity, request: ISemaphoreProofRequest): Promise<ISafeProof> {
        const {
            circuitFilePath,
            zkeyFilePath,
            merkleStorageAddress,
            externalNullifier,
            signal,
            merkleProof: mProof,
        } = request
        let merkleProof: MerkleProof = mProof;

        if (merkleStorageAddress) {
            const response: AxiosResponse = await axios.post(merkleStorageAddress, {
                identityCommitment: bigintToHex(identity.genIdentityCommitment())
            })

            merkleProof = deserializeMerkleProof(response.data.merkleProof)
        }

        const witness = Semaphore.genWitness(identity.getIdentity(), merkleProof, externalNullifier, signal)

        const fullProof: FullProof = await Semaphore.genProof(witness, circuitFilePath, zkeyFilePath)
        const solidityProof = Semaphore.packToSolidityProof(fullProof)

        const nullifierHash: bigint = Semaphore.genNullifierHash(externalNullifier, identity.getNullifier())
        const root = merkleStorageAddress ? bigintToHex(merkleProof.root) : merkleProof.root;
        const publicSignals: Array<string> = [
            root,
            bigintToHex(nullifierHash),
            bigintToHex(genSignalHash(signal)),
            externalNullifier
        ]

        return {
            fullProof,
            solidityProof,
            publicSignals
        }
    }
}
