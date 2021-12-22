import { Rln, MerkleProof, FullProof, genSignalHash, generateMerkleProof } from '@libsem/protocols'
import { ZkIdentity } from '@libsem/identity'
import { bigintToHex, hexToBigint } from 'bigint-conversion'
import axios, { AxiosResponse } from 'axios'
import { ISafeProof, IRLNProofRequest } from './interfaces'
import { deserializeMerkleProof, poseidonHash } from './utils'

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
        let merkleProof: MerkleProof;;

        identity.genSecretFromIdentity();
        const secretHash: bigint = poseidonHash(identity.getSecret());
        const signalHash = genSignalHash(signal);
        const identityCommitment = identity.genIdentityCommitment()
        if (merkleStorageAddress) {
            const response: AxiosResponse = await axios.post(merkleStorageAddress, {
                identityCommitment: bigintToHex(identityCommitment)
            })

            merkleProof = deserializeMerkleProof(response.data.merkleProof)
        } else {
            merkleProof = generateMerkleProof(merkleProofArtifacts?.depth, BigInt(0), merkleProofArtifacts?.leavesPerNode, merkleProofArtifacts?.leaves, identityCommitment)
        }

        const witness = Rln.genWitness(secretHash, merkleProof, externalNullifier, signal, hexToBigint(rlnIdentifier))

        const fullProof: FullProof = await Rln.genProof(witness, circuitFilePath, zkeyFilePath)
        const solidityProof = Rln.packToSolidityProof(fullProof)

        const [y, nullifier] = Rln.calculateOutput(secretHash, BigInt(externalNullifier), hexToBigint(rlnIdentifier), signalHash)
        const root = merkleStorageAddress ? bigintToHex(merkleProof.root) : merkleProof.root;
        const publicSignals: Array<string> = [
            bigintToHex(y),
            root,
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
