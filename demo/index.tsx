import React, {useState, useEffect} from 'react'
import ReactDOM from 'react-dom'
import { genExternalNullifier, Rln } from '@libsem/protocols'
import { bigintToHex, hexToBigint } from 'bigint-conversion'
const { ZkIdentity } = require('@libsem/identity')

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

enum MerkleProofType {
    STORAGE_ADDRESS,
    ARTIFACTS
}

const genMockIdentityCommitments = (): string[] => {
    let identityCommitments: string[] = [];
    for(let i = 0; i < 10; i++) {
        const mockIdentity = new ZkIdentity()
        identityCommitments.push(bigintToHex(mockIdentity.genIdentityCommitment()))
    }
    return identityCommitments;
    
}

function App() {

    const [client, setClient] = useState(null);
    const [identityCommitment, setIdentityCommitment] = useState();
    const mockIdentityCommitments: string[] = genMockIdentityCommitments();

    const genSemaphoreProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {

        const externalNullifier = genExternalNullifier('voting-1')
        const signal = '0x111'

        let storageAddressOrArtifacts: any = merkleStorageAddress;
        if(proofType === MerkleProofType.ARTIFACTS) {

            if(!mockIdentityCommitments.includes(identityCommitment)) {
                mockIdentityCommitments.push(identityCommitment);
            }
            storageAddressOrArtifacts = {
                leaves: mockIdentityCommitments,
                depth: 20,
                leavesPerNode: 2
            }
        }


        const safeProof = await client.semaphoreProof(
            externalNullifier,
            signal,
            semaphorePaths.circuitFilePath,
            semaphorePaths.zkeyFilePath,
            storageAddressOrArtifacts,                
        )

        console.log(safeProof)

    };

    const genRLNProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {
        const externalNullifier = genExternalNullifier('voting-1')
        const signal = '0x111'
        const rlnIdentifier = Rln.genIdentifier();
        const rlnIdentifierHex = bigintToHex(rlnIdentifier);

        let storageAddressOrArtifacts: any = merkleStorageAddress;
        if(proofType === MerkleProofType.ARTIFACTS) {

            if(!mockIdentityCommitments.includes(identityCommitment)) {
                mockIdentityCommitments.push(identityCommitment);
            }

            storageAddressOrArtifacts = {
                leaves: mockIdentityCommitments,
                depth: 20,
                leavesPerNode: 2
            }
        }

        const safeProof = await client.rlnProof(
            externalNullifier,
            signal,
            rlnPaths.circuitFilePath,
            rlnPaths.zkeyFilePath,
            storageAddressOrArtifacts,
            rlnIdentifierHex
        )

        console.log(safeProof)

    };

    const genNRLNProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {

        const externalNullifier = genExternalNullifier('voting-1')
        const signal = '0x111'
        const rlnIdentifier = Rln.genIdentifier();
        const rlnIdentifierHex = bigintToHex(rlnIdentifier);       

        let storageAddressOrArtifacts: any = merkleStorageAddress;
        if(proofType === MerkleProofType.ARTIFACTS) {
            if(!mockIdentityCommitments.includes(identityCommitment)) {
                mockIdentityCommitments.push(identityCommitment);
            }
            storageAddressOrArtifacts = {
                leaves: mockIdentityCommitments,
                depth: 20,
                leavesPerNode: 2
            }
        }

        const safeProof = await client.nRlnProof(
            externalNullifier,
            signal,
            nRlnPaths.circuitFilePath,
            nRlnPaths.zkeyFilePath,
            storageAddressOrArtifacts,
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

    useEffect(() => {

        if(client)  {
            (async function () {
                const activeIdentity = await client.getActiveIdentity();
            
                setIdentityCommitment(activeIdentity);
            })();
        }
        
    }, [client])


    return (
    <div>
    <div>Hello world</div>
    <hr />
    <div>
        <button onClick={() => genSemaphoreProof(MerkleProofType.STORAGE_ADDRESS)}>Generate Semaphore Proof from Merkle proof storage address</button> <br /><br />
        <button onClick={() => genSemaphoreProof(MerkleProofType.ARTIFACTS)}>Generate Semaphore Proof from Merkle proof artifacts</button>
    </div>
    <hr />
    <div>
        <button onClick={() => genRLNProof(MerkleProofType.STORAGE_ADDRESS)}>Generate RLN Proof from Merkle proof storage address</button> <br /><br />
        <button onClick={() => genRLNProof(MerkleProofType.ARTIFACTS)}>Generate RLN Proof from Merkle proof artifacts</button>
    </div>
    <hr />
    <div>
        <button onClick={() => genNRLNProof(MerkleProofType.STORAGE_ADDRESS)}>Generate NRLN Proof from Merkle storage address</button> <br /><br />
        <button onClick={() => genNRLNProof(MerkleProofType.ARTIFACTS)}>Generate NRLN Proof from Merkle proof artifacts</button>
    </div>

    </div>
    )
}

const root = document.getElementById('root')

ReactDOM.render(<App />, root)
