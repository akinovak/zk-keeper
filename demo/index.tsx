import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { genExternalNullifier, RLN } from '@zk-kit/protocols'
import { bigintToHex } from 'bigint-conversion'
import { ZkIdentity } from '@zk-kit/identity'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const semaphorePath = {
    circuitFilePath: "http://localhost:8000/semaphore/semaphore.wasm",
    zkeyFilePath: "http://localhost:8000/semaphore/semaphore_final.zkey"
};

const rlnPath = {
    circuitFilePath: "http://localhost:8000/rln/rln.wasm",
    zkeyFilePath: "http://localhost:8000/rln/rln_final.zkey"
};

const merkleStorageAddress = 'http://localhost:8090/merkleProof'

enum MerkleProofType {
    STORAGE_ADDRESS,
    ARTIFACTS
}

const genMockIdentityCommitments = (): string[] => {
    let identityCommitments: string[] = [];
    for (let i = 0; i < 10; i++) {
        const mockIdentity = new ZkIdentity()
        let idCommitment = bigintToHex(mockIdentity.genIdentityCommitment());

        identityCommitments.push(idCommitment)
    }
    return identityCommitments;
}

function App() {


    const [client, setClient] = useState(null);
    const [identityCommitment, setIdentityCommitment] = useState("");
    const mockIdentityCommitments: string[] = genMockIdentityCommitments();

    const genSemaphoreProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {

        const externalNullifier = genExternalNullifier('voting-1')
        const signal = '0x111'

        let storageAddressOrArtifacts: any = merkleStorageAddress;
        if (proofType === MerkleProofType.ARTIFACTS) {

            if (!mockIdentityCommitments.includes(identityCommitment)) {
                mockIdentityCommitments.push(identityCommitment);
            }
            storageAddressOrArtifacts = {
                leaves: mockIdentityCommitments,
                depth: 15,
                leavesPerNode: 2
            }
        }

        try {
            const proof = await client.semaphoreProof(
                externalNullifier,
                signal,
                semaphorePath.circuitFilePath,
                semaphorePath.zkeyFilePath,
                storageAddressOrArtifacts,
            )

            console.log("semaphore proof", proof);
            toast("Semaphore proof generated successfully!");
        } catch (e) {
            toast("Error while generating Semaphore proof!");
            console.error(e);
        }
    };

    const genRLNProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {
        const externalNullifier = genExternalNullifier('voting-1')
        const signal = '0x111'
        const rlnIdentifier = RLN.genIdentifier();
        const rlnIdentifierHex = bigintToHex(rlnIdentifier);

        let storageAddressOrArtifacts: any = merkleStorageAddress;

        if (proofType === MerkleProofType.ARTIFACTS) {

            if (!mockIdentityCommitments.includes(identityCommitment)) {
                mockIdentityCommitments.push(identityCommitment);
            }

            storageAddressOrArtifacts = {
                leaves: mockIdentityCommitments,
                depth: 15,
                leavesPerNode: 2
            }
        }

        let circuitPath = rlnPath.circuitFilePath;
        let zkeyFilePath = rlnPath.zkeyFilePath;

        try {
            
            const proof = await client.rlnProof(
                externalNullifier,
                signal,
                circuitPath,
                zkeyFilePath,
                storageAddressOrArtifacts,
                rlnIdentifierHex
            )

            console.log("RLN proof", proof);
            toast("RLN proof generated successfully!");
        } catch (e) {
            toast("Error while generating RLN proof!");
            console.error(e);
        }


    };

    const getIdentityCommitment = async () => {
        const idCommitment = await client.getActiveIdentity();
        setIdentityCommitment(idCommitment);
    }



    useEffect(() => {
        (async function IIFE() {
            const { injected } = window as any
            const client = await injected.connect()
            setClient(client);
        })();
    }, [])

    useEffect(() => {

        if (client) {
            (async function () {
                await getIdentityCommitment();
            })();
        }

    }, [client])


    return (
        <div>
            <div>
                <h2>Semaphore</h2>
                <button onClick={() => genSemaphoreProof(MerkleProofType.STORAGE_ADDRESS)}>Generate proof from Merkle proof storage address</button> <br /><br />
                <button onClick={() => genSemaphoreProof(MerkleProofType.ARTIFACTS)}>Generate proof from Merkle proof artifacts</button>
            </div>
            <hr />
            <div>
                <h2>RLN</h2>
                <button onClick={() => genRLNProof(MerkleProofType.STORAGE_ADDRESS)}>Generate proof from Merkle proof storage address</button> <br /><br />
                <button onClick={() => genRLNProof(MerkleProofType.ARTIFACTS)}>Generate proof from Merkle proof artifacts</button>
            </div>

            <hr />
            <div>
                <h2>Get identity commitment</h2>
                <button onClick={() => getIdentityCommitment()}>Get</button> <br /><br />
            </div>

            <hr />
            <div>
                <h2>Identity commitment for active identity:</h2>
                <p>{identityCommitment}</p>
            </div>

            <ToastContainer />
        </div>
    )
}

const root = document.getElementById('root')

ReactDOM.render(<App />, root)
