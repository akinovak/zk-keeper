const bigintConversion = require('bigint-conversion')
const { genExternalNullifier } = require('@libsem/protocols')

const circuitFilePath = 'http://localhost:8000/semaphore.wasm'
const zkeyFilePath = 'http://localhost:8000/semaphore_final.zkey'
const merkleStorageAddress = 'http://localhost:5000/merkle'

;(async () => {
    window.addEventListener('load', async (event) => {
        const client = await injected.connect()
        const externalNullifier = genExternalNullifier('voting-1')
        const signal = '0x111'

        const safeProof = await client.semaphoreProof(
            externalNullifier,
            signal,
            merkleStorageAddress,
            circuitFilePath,
            zkeyFilePath
        )

        console.log(safeProof)
    })
})()
