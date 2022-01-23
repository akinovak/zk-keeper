import { NRLN, MerkleProof, FullProof, genSignalHash, generateMerkleProof } from '@zk-kit/protocols'
import { ZkIdentity, SecretType } from '@zk-kit/identity'
import { bigintToHex, hexToBigint } from 'bigint-conversion'
import axios, { AxiosResponse } from 'axios'
import { ISafeProof, IRLNProofRequest } from './interfaces'
import { deserializeMerkleProof} from './utils'
import { MerkleProofArtifacts } from '@src/types'

export default class NRLNService {
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
            rlnIdentifier,
            spamThreshold            
        } = request
        let merkleProof: MerkleProof;

        let SPAM_TRESHOLD = (spamThreshold as number);
        const identitySecret: bigint[] = identity.getMultipartSecret(spamThreshold);
        const signalHash = genSignalHash(signal);
        const identityCommitment = identity.genIdentityCommitment(SecretType.MULTIPART, SPAM_TRESHOLD);
        if (merkleStorageAddress) {
            const response: AxiosResponse = await axios.post(merkleStorageAddress, {
                identityCommitment: bigintToHex(identityCommitment),
                spamThreshold: SPAM_TRESHOLD
            })

            merkleProof = deserializeMerkleProof(response.data.merkleProof)
        } else {
            let proofArtifacts = (merkleProofArtifacts as MerkleProofArtifacts);
            const leaves = proofArtifacts.leaves.map(leaf => hexToBigint(leaf));
            merkleProof = generateMerkleProof(proofArtifacts.depth, BigInt(0), proofArtifacts.leavesPerNode, leaves, identityCommitment)
        }

        const witness = NRLN.genWitness(identitySecret, merkleProof, externalNullifier, signal, hexToBigint(rlnIdentifier))

        const fullProof: FullProof = await NRLN.genProof(witness, circuitFilePath, zkeyFilePath)
        const solidityProof = NRLN.packToSolidityProof(fullProof)

        const [y, nullifier] = NRLN.calculateOutput(identitySecret, BigInt(externalNullifier), signalHash, SPAM_TRESHOLD,  hexToBigint(rlnIdentifier))
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
