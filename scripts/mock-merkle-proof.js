// eslint-disable-next-line import/no-extraneous-dependencies
const express = require('express')
const { generateMerkleProof } = require('@zk-kit/protocols')
const { ZkIdentity } = require('@zk-kit/identity')
const { bigintToHex, hexToBigint } = require('bigint-conversion')

const DEPTH_RLN = 15
const NUMBER_OF_LEAVES_RLN = 2
const DEPTH_SEMAPHORE = 20
const NUMBER_OF_LEAVES_SEMAPHORE = 5
const ZERO_VALUE = BigInt(0)


const serializeMerkleProof = (merkleProof) => {
    const serialized = {}
    serialized.root = bigintToHex(merkleProof.root)
    serialized.siblings = merkleProof.siblings.map((siblings) =>
        siblings.map((element) => bigintToHex(element))
    )
    serialized.pathIndices = merkleProof.pathIndices
    serialized.leaf = bigintToHex(merkleProof.leaf)
    return serialized
}

const generateMerkleProofRLN = (identityCommitments, leafIndex) => {
    return generateMerkleProof(
        DEPTH_RLN,
        ZERO_VALUE,
        NUMBER_OF_LEAVES_RLN,
        identityCommitments,
        leafIndex
    )
}

const generateMerkleProofSemaphore = (identityCommitments, leafIndex) => {
    return generateMerkleProof(
        DEPTH_SEMAPHORE,
        ZERO_VALUE,
        NUMBER_OF_LEAVES_SEMAPHORE,
        identityCommitments,
        leafIndex
    )
}

const identityCommitments = []

// eslint-disable-next-line no-plusplus
for (let i = 0; i < 2; i++) {
    const mockIdentity = new ZkIdentity()
    identityCommitments.push(mockIdentity.genIdentityCommitment())
}


const app = express()
app.use(express.json())


app.post('/merkleProof/:type', (req, res) => {
    let type = req.params.type;
    let { identityCommitment } = req.body
    identityCommitment = hexToBigint(identityCommitment)

    if (!identityCommitments.includes(identityCommitment)) {
        identityCommitments.push(identityCommitment)
    }
    const leafIndex = identityCommitments.indexOf(identityCommitment);

    const merkleProof = type === 'RLN' ? generateMerkleProofRLN(identityCommitments, leafIndex) : generateMerkleProofSemaphore(identityCommitments, leafIndex)

    const serializedMerkleProof = serializeMerkleProof(merkleProof)
    console.log('Sending proof with root: ', serializedMerkleProof.root)
    res.send({ merkleProof: serializedMerkleProof })
})


app.listen(8090, () => {
    console.log('Merkle service is listening')
})
