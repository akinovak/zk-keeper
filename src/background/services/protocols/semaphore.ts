import { GenericService } from '@src/util/svc'
import { Semaphore, MerkleProof, FullProof, genSignalHash } from '@libsem/protocols'
import { ZkIdentity } from '@libsem/identity'
import { bigintToHex } from 'bigint-conversion'
import { ISafeProof, ISemaphoreProofRequest } from './interfaces'
import axios, { AxiosResponse } from 'axios'
import { deserializeMerkleProof } from './utils'

export default class SemaphoreService extends GenericService {
    async genProof(identity: ZkIdentity, request: ISemaphoreProofRequest): Promise<ISafeProof> {
        const { circuitFilePath, zkeyFilePath, merkleStorageAddress, externalNullifier, signal } = request
        const response: AxiosResponse = await axios.post(merkleStorageAddress, {
            identityCommitment: bigintToHex(identity.genIdentityCommitment())
        })

        const merkleProof: MerkleProof = deserializeMerkleProof(response.data.merkleProof)
        const witness = Semaphore.genWitness(identity.getIdentity(), merkleProof, externalNullifier, signal)

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
    }
}
