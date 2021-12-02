import { hexToBigint } from 'bigint-conversion'
import { MerkleProof } from '@libsem/protocols'

export function deserializeMerkleProof(merkleProof): MerkleProof {
    const deserialized: MerkleProof = {}
    deserialized.root = hexToBigint(merkleProof.root)
    deserialized.pathElements = merkleProof.pathElements.map((siblings) => {
        return siblings.map((element) => hexToBigint(element))
    })
    deserialized.indices = merkleProof.indices
    return deserialized
}
