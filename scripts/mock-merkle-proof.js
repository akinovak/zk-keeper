// eslint-disable-next-line import/no-extraneous-dependencies
const express = require('express')
const { generateMerkleProof } = require('@libsem/protocols')
const { ZkIdentity } = require('@libsem/identity')
const { bigintToHex, hexToBigint } = require('bigint-conversion')

const DEPTH = 20
const ZERO_VALUE = BigInt(0)
const NUMBER_OF_LEAVES = 2

const serializeMerkleProof = (merkleProof) => {
    const serialized = {}
    serialized.root = bigintToHex(merkleProof.root)
    serialized.pathElements = merkleProof.pathElements.map((siblings) =>
        siblings.map((element) => bigintToHex(element))
    )
    serialized.indices = merkleProof.indices
    return serialized
}

const numberOfLeaves = 5
const identityCommitments = []

// eslint-disable-next-line no-plusplus
for (let i = 0; i < numberOfLeaves; i++) {
    const mockIdentity = new ZkIdentity()
    identityCommitments.push(mockIdentity.genIdentityCommitment())
}

const app = express()
app.use(express.json())

app.post('/merkle', (req, res) => {
    let { identityCommitment } = req.body
    identityCommitment = hexToBigint(identityCommitment)

    // For testing purposes, if commitment is not in set, add it to obtain valid proof
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

app.listen(5000, () => {
    console.log('Merkle service is listening')
})
