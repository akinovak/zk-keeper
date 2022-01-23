import { hexToBigint } from 'bigint-conversion'
import { MerkleProof } from '@zk-kit/protocols'
import * as ciromlibjs from "circomlibjs"

// eslint-disable-next-line import/prefer-default-export
export function deserializeMerkleProof(merkleProof): MerkleProof {
    const deserialized: MerkleProof = {}
    deserialized.root = hexToBigint(merkleProof.root)
    deserialized.pathElements = merkleProof.pathElements.map((siblings) =>
        siblings.map((element) => hexToBigint(element))
    )
    deserialized.indices = merkleProof.indices
    return deserialized
}

export const poseidonHash = (data: Array<bigint>): bigint => {
    return ciromlibjs.poseidon(data)
  }
  