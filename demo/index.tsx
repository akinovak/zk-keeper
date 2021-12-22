import React, {useState, useEffect} from 'react'
import ReactDOM from 'react-dom'
import { genExternalNullifier, Rln } from '@libsem/protocols'
import { bigintToHex, hexToBigint } from 'bigint-conversion'

const semaphorePaths = {
    circuitFilePath: "http://localhost:8000/semaphore.wasm",
    zkeyFilePath: "http://localhost:8000/semaphore_final.zkey"
};

const rlnPaths = {
    circuitFilePath: "http://localhost:8000/rln.wasm",
    zkeyFilePath: "http://localhost:8000/rln_final.zkey"
};

const nRlnPaths = {
    circuitFilePath: "http://localhost:8000/nrln.wasm",
    zkeyFilePath: "http://localhost:8000/nrln_final.zkey"
}

const merkleStorageAddress = 'http://localhost:8090/merkle'

function App() {

    const [client, setClient] = useState(null);

    const genSemaphoreProof = async () => {

        const externalNullifier = genExternalNullifier('voting-1')
        const signal = '0x111'

        const safeProof = await client.semaphoreProof(
            externalNullifier,
            signal,
            semaphorePaths.circuitFilePath,
            semaphorePaths.zkeyFilePath,
            merkleStorageAddress,                
        )

        console.log(safeProof)

    };

    const genRLNProof = async () => {
        const externalNullifier = genExternalNullifier('voting-1')
        const signal = '0x111'
        const rlnIdentifier = Rln.genIdentifier();
        const rlnIdentifierHex = bigintToHex(rlnIdentifier);

        const safeProof = await client.rlnProof(
            externalNullifier,
            signal,
            rlnPaths.circuitFilePath,
            rlnPaths.zkeyFilePath,
            merkleStorageAddress,
            rlnIdentifierHex
        )

        console.log(safeProof)

    };

    const genNRLNProof = async () => {

        const externalNullifier = genExternalNullifier('voting-1')
        const signal = '0x111'
        const rlnIdentifier = Rln.genIdentifier();
        const rlnIdentifierHex = bigintToHex(rlnIdentifier);       

        const safeProof = await client.nRlnProof(
            externalNullifier,
            signal,
            nRlnPaths.circuitFilePath,
            nRlnPaths.zkeyFilePath,
            merkleStorageAddress,
            rlnIdentifierHex,
            3
        )

        console.log(safeProof)

    }


    useEffect(() => {
        (async function IIFE() {
        const { injected } = window as any
        const client = await injected.connect()

        setClient(client);
        })();
    }, [])



    return (
    <div>
    <div>Hello world</div>
    <hr />
    <div>
        <button onClick={() => genSemaphoreProof()}>Generate Semaphore Proof</button>
    </div>
    <hr />
    <div>
        <button onClick={() => genRLNProof()}>Generate RLN Proof</button>
    </div>
    <hr />
    <div>
        <button onClick={() => genNRLNProof()}>Generate NRLN Proof</button>
    </div>

    </div>
    )
}

const root = document.getElementById('root')

ReactDOM.render(<App />, root)
