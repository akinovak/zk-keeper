import React from 'react'
import ReactDOM from 'react-dom'
import { genExternalNullifier } from '@libsem/protocols'

const circuitFilePath = 'http://localhost:8000/semaphore.wasm'
const zkeyFilePath = 'http://localhost:8000/semaphore_final.zkey'
const merkleStorageAddress = 'http://localhost:5000/merkle'

function App() {
    React.useEffect(() => {
        ;(async function IIFE() {
            const client = await window.injected.connect()
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
        })()
    }, [])

    return <div>Hello world</div>
}

const root = document.getElementById('root')

ReactDOM.render(<App />, root)
