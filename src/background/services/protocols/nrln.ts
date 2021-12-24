import { NRln, MerkleProof, FullProof, genSignalHash, generateMerkleProof } from '@libsem/protocols'
import { ZkIdentity } from '@libsem/identity'
import { bigintToHex, hexToBigint } from 'bigint-conversion'
import axios, { AxiosResponse } from 'axios'
import { ISafeProof, INRLNProofRequest } from './interfaces'
import { deserializeMerkleProof} from './utils'

export default class NRLNService {
    // eslint-disable-next-line class-methods-use-this
    async genProof(identity: ZkIdentity, request: INRLNProofRequest): Promise<ISafeProof> {
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

        identity.genRandomSecret(spamThreshold);
        const identitySecret: bigint[] = identity.getSecret();
        const signalHash = genSignalHash(signal);
        const identityCommitment = identity.genIdentityCommitmentFromSecret();

        if (merkleStorageAddress) {
            const response: AxiosResponse = await axios.post(merkleStorageAddress, {
                identityCommitment: bigintToHex(identityCommitment)
            })

            merkleProof = deserializeMerkleProof(response.data.merkleProof)
        } else {
            let leaves = merkleProofArtifacts?.leaves.map(leaf => hexToBigint(leaf));
            merkleProof = generateMerkleProof(merkleProofArtifacts?.depth, BigInt(0), merkleProofArtifacts?.leavesPerNode, leaves, identityCommitment)
        }

        const witness = NRln.genWitness(identitySecret, merkleProof, externalNullifier, signal, hexToBigint(rlnIdentifier))

        const fullProof: FullProof = await NRln.genProof(witness, circuitFilePath, zkeyFilePath)
        const solidityProof = NRln.packToSolidityProof(fullProof)

        const [y, nullifier] = NRln.calculateOutput(identitySecret, BigInt(externalNullifier), signalHash, spamThreshold,  hexToBigint(rlnIdentifier))
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
        throw new Error(`Error while generating NRLN proof: ${e}`);
    }
    }
}
