import { NRln, MerkleProof, FullProof, genSignalHash } from '@libsem/protocols'
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
            merkleProof: mProof,
            rlnIdentifier,
            spamThreshold            
        } = request
        let merkleProof: MerkleProof = mProof;

        identity.genRandomSecret(spamThreshold);
        const identitySecret: bigint[] = identity.getSecret();
        const signalHash = genSignalHash(signal);

        if (merkleStorageAddress) {
            const response: AxiosResponse = await axios.post(merkleStorageAddress, {
                identityCommitment: bigintToHex(identity.genIdentityCommitmentFromSecret())
            })

            merkleProof = deserializeMerkleProof(response.data.merkleProof)
        }

        const witness = NRln.genWitness(identitySecret, merkleProof, externalNullifier, signal, hexToBigint(rlnIdentifier))

        const fullProof: FullProof = await NRln.genProof(witness, circuitFilePath, zkeyFilePath)
        const solidityProof = NRln.packToSolidityProof(fullProof)

        const [y, nullifier] = NRln.calculateOutput(identitySecret, BigInt(externalNullifier), signalHash, spamThreshold,  hexToBigint(rlnIdentifier))
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
        throw new Error(`Error while generating NRLN proof: ${e}`);
    }
    }
}
