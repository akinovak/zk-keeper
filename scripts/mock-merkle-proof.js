// eslint-disable-next-line import/no-extraneous-dependencies
const express = require('express')
const { generateMerkleProof } = require('@libsem/protocols')
const { ZkIdentity, SecretType } = require('@libsem/identity')
const { bigintToHex, hexToBigint } = require('bigint-conversion')

const DEPTH = 15
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

const numberOfLeaves = 2
const identityCommitmentsSemaphore = []
const identityCommitmentsRLNDefault = []
const identityCommitmentsRLNSpamThreshold3 = []

// eslint-disable-next-line no-plusplus
for (let i = 0; i < numberOfLeaves; i++) {
    const mockIdentity = new ZkIdentity()
    identityCommitmentsSemaphore.push(mockIdentity.genIdentityCommitment())
}

// eslint-disable-next-line no-plusplus
for (let i = 0; i < numberOfLeaves; i++) {
    const mockIdentity = new ZkIdentity()
    mockIdentity.genMultipartSecret(2);
    identityCommitmentsRLNDefault.push(mockIdentity.genIdentityCommitment(SecretType.MULTIPART_SECRET))
}

// eslint-disable-next-line no-plusplus
for (let i = 0; i < numberOfLeaves; i++) {
    const mockIdentity = new ZkIdentity()
    mockIdentity.genMultipartSecret(3);
    identityCommitmentsRLNSpamThreshold3.push(mockIdentity.genIdentityCommitment(SecretType.MULTIPART_SECRET))
}

const app = express()
app.use(express.json())

app.post('/merkleProofRLN', (req, res) => {
    let { identityCommitment, spamThreshold } = req.body
    identityCommitment = hexToBigint(identityCommitment)

    let identityCommitments = identityCommitmentsRLNDefault;
    // For testing purposes, if commitment is not in set, add it to obtain valid proof
    if(spamThreshold > 2) {
        identityCommitments = identityCommitmentsRLNSpamThreshold3;
    } 
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

app.post('/merkleProofSemaphore', (req, res) => {
    let { identityCommitment } = req.body
    identityCommitment = hexToBigint(identityCommitment)

    if (!identityCommitmentsSemaphore.includes(identityCommitment)) {
        identityCommitmentsSemaphore.push(identityCommitment)
    }

    const merkleProof = generateMerkleProof(
        DEPTH,
        ZERO_VALUE,
        NUMBER_OF_LEAVES,
        identityCommitmentsSemaphore,
        identityCommitment
    )
    const serializedMerkleProof = serializeMerkleProof(merkleProof)
    console.log('Sending proof with root: ', serializedMerkleProof.root)
    res.send({ merkleProof: serializedMerkleProof })
})


app.listen(8090, () => {
    console.log('Merkle service is listening')
})
