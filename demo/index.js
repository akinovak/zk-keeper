const { genExternalNullifier } = require('@libsem/protocols')

const circuitFilePath = 'http://localhost:8000/semaphore.wasm'
const zkeyFilePath = 'http://localhost:8000/semaphore_final.zkey'
const merkleStorageAddress = 'http://localhost:5000/merkle'

;(async () => {
    // eslint-disable-next-line no-undef
    window.addEventListener('load', async () => {
        // eslint-disable-next-line no-undef
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

        // eslint-disable-next-line no-console
        console.log(safeProof)
    })
})()
