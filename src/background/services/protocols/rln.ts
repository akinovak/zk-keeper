import { RLN, MerkleProof, FullProof, genSignalHash, generateMerkleProof } from '@zk-kit/protocols'
import { ZkIdentity } from '@zk-kit/identity'
import { bigintToHex, hexToBigint } from 'bigint-conversion'
import axios, { AxiosResponse } from 'axios'
import { ISafeProof, IRLNProofRequest } from './interfaces'
import { deserializeMerkleProof} from './utils'
import { MerkleProofArtifacts } from '@src/types'

export default class RLNService {
    // eslint-disable-next-line class-methods-use-this
    async genProof(identity: ZkIdentity, request: IRLNProofRequest): Promise<ISafeProof> {
        try {
        const {
            circuitFilePath,
            zkeyFilePath,
            merkleStorageAddress,
            externalNullifier,
            signal,
            merkleProofArtifacts,
            rlnIdentifier
        } = request
        let merkleProof: MerkleProof;

        const identitySecretHash: bigint = identity.getSecretHash();
        const signalHash = genSignalHash(signal);
        const identityCommitment = identity.genIdentityCommitment();
        if (merkleStorageAddress) {
            const response: AxiosResponse = await axios.post(merkleStorageAddress, {
                identityCommitment: bigintToHex(identityCommitment)
            })

            merkleProof = deserializeMerkleProof(response.data.merkleProof)
        } else {
            let proofArtifacts = (merkleProofArtifacts as MerkleProofArtifacts);
            const leaves = proofArtifacts.leaves.map(leaf => hexToBigint(leaf));
            merkleProof = generateMerkleProof(proofArtifacts.depth, BigInt(0), proofArtifacts.leavesPerNode, leaves, identityCommitment)
        }

        const witness = RLN.genWitness(identitySecretHash, merkleProof, externalNullifier, signal, hexToBigint(rlnIdentifier))

        const fullProof: FullProof = await RLN.genProof(witness, circuitFilePath, zkeyFilePath)
        const solidityProof = RLN.packToSolidityProof(fullProof)

        const [y, nullifier] = RLN.calculateOutput(identitySecretHash, BigInt(externalNullifier), hexToBigint(rlnIdentifier), signalHash)
        const publicSignals: Array<string> = [
            bigintToHex(y),
            bigintToHex(merkleProof.root),
            bigintToHex(nullifier),
            bigintToHex(signalHash),
            externalNullifier,
            rlnIdentifier
        ]


        return {
            fullProof,
            solidityProof,
            publicSignals
        }
    } catch(e) {
        throw new Error(`Error while generating RLN proof: ${e}`);
    }
    }
}
