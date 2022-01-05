import { RLN, MerkleProof, FullProof, genSignalHash, generateMerkleProof } from '@libsem/protocols'
import { ZkIdentity, SecretType } from '@libsem/identity'
import { bigintToHex, hexToBigint } from 'bigint-conversion'
import axios, { AxiosResponse } from 'axios'
import { ISafeProof, IRLNProofRequest } from './interfaces'
import { deserializeMerkleProof} from './utils'

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
        const spamThreshold = request.spamThreshold ? request.spamThreshold : 2;

        identity.genMultipartSecret(spamThreshold);

        const identitySecret: bigint[] = identity.getMultipartSecret();
        const signalHash = genSignalHash(signal);
        const identityCommitment = identity.genIdentityCommitment(SecretType.MULTIPART_SECRET);
        if (merkleStorageAddress) {
            const response: AxiosResponse = await axios.post(merkleStorageAddress, {
                identityCommitment: bigintToHex(identityCommitment),
                spamThreshold: spamThreshold
            })

            merkleProof = deserializeMerkleProof(response.data.merkleProof)
        } else {
            const leaves = merkleProofArtifacts?.leaves.map(leaf => hexToBigint(leaf));
            merkleProof = generateMerkleProof(merkleProofArtifacts?.depth, BigInt(0), merkleProofArtifacts?.leavesPerNode, leaves, identityCommitment)
        }

        const witness = RLN.genWitness(identitySecret, merkleProof, externalNullifier, signal, hexToBigint(rlnIdentifier))

        const fullProof: FullProof = await RLN.genProof(witness, circuitFilePath, zkeyFilePath)
        const solidityProof = RLN.packToSolidityProof(fullProof)

        const [y, nullifier] = RLN.calculateOutput(identitySecret, BigInt(externalNullifier), signalHash, spamThreshold,  hexToBigint(rlnIdentifier))
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
