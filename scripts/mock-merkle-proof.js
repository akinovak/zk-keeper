// eslint-disable-next-line import/no-extraneous-dependencies
const express = require('express')
const { generateMerkleProof } = require('@zk-kit/protocols')
const { ZkIdentity } = require('@zk-kit/identity')
const { bigintToHex, hexToBigint } = require('bigint-conversion')

const DEPTH = 15
const ZERO_VALUE = BigInt(0)
const NUMBER_OF_LEAVES = 2

const serializeMerkleProof = (merkleProof) => {
    const serialized = {}
    serialized.root = bigintToHex(merkleProof.root)
    serialized.siblings = merkleProof.siblings.map((siblings) =>
        siblings.map((element) => bigintToHex(element))
    )
    serialized.pathIndices = merkleProof.pathIndices
    return serialized
}

const numberOfLeaves = 2
const identityCommitments = []

// eslint-disable-next-line no-plusplus
for (let i = 0; i < numberOfLeaves; i++) {
    const mockIdentity = new ZkIdentity()
    identityCommitments.push(mockIdentity.genIdentityCommitment())
}


const app = express()
app.use(express.json())


app.post('/merkleProof', (req, res) => {
    let { identityCommitment } = req.body
    identityCommitment = hexToBigint(identityCommitment)

    if (!identityCommitments.includes(identityCommitment)) {
        identityCommitments.push(identityCommitment)
    }

    const merkleProof = generateMerkleProof(
        DEPTH,
        ZERO_VALUE,
        NUMBER_OF_LEAVES,
        identityCommitments,
        identityCommitment
    )
    const serializedMerkleProof = serializeMerkleProof(merkleProof)
    console.log('Sending proof with root: ', serializedMerkleProof.root)
    res.send({ merkleProof: serializedMerkleProof })
})


app.listen(8090, () => {
    console.log('Merkle service is listening')
})
