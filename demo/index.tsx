import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { genExternalNullifier, RLN } from '@zk-kit/protocols'
import { bigintToHex, hexToBigint } from 'bigint-conversion'
const { ZkIdentity, SecretType } = require('@zk-kit/identity')

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

const nrlnPath = {
    circuitFilePath: "http://localhost:8000/nrln/rln.wasm",
    zkeyFilePath: "http://localhost:8000/nrln/rln_final.zkey"
}

const merkleStorageAddressRLN = 'http://localhost:8090/merkleProofRLN'
const merkleStorageAddressSemaphore = 'http://localhost:8090/merkleProofSemaphore'

enum MerkleProofType {
    STORAGE_ADDRESS,
    ARTIFACTS
}

enum ZkProofType {
    SEMAPHORE,
    RLN
}

const genMockIdentityCommitments = (proofType: ZkProofType, spamThreshold: number = 2): string[] => {
    let identityCommitments: string[] = [];
    for (let i = 0; i < 10; i++) {
        const mockIdentity = new ZkIdentity()
        let idCommitment = '';
        if (proofType === ZkProofType.SEMAPHORE) {
            idCommitment = bigintToHex(mockIdentity.genIdentityCommitment());
        } else {
            mockIdentity.genMultipartSecret(spamThreshold);
            idCommitment = bigintToHex(mockIdentity.genIdentityCommitment(SecretType.MULTIPART_SECRET));
        }


        identityCommitments.push(idCommitment)
    }
    return identityCommitments;
}

function App() {

    const [client, setClient] = useState(null);
    const [identityCommitmentGeneric, setIdentityCommitmentGeneric] = useState();
    const [identityCommitmentMultipart, setIdentityCommitmentMultipart] = useState();
    const mockIdentityCommitmentsSemaphore: string[] = genMockIdentityCommitments(ZkProofType.SEMAPHORE);
    const mockIdentityCommitmentsRLN: string[] = genMockIdentityCommitments(ZkProofType.RLN, 2);
    const mockIdentityCommitmentsNRLN: string[] = genMockIdentityCommitments(ZkProofType.RLN, 3);

    const genSemaphoreProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {

        const externalNullifier = genExternalNullifier('voting-1')
        const signal = '0x111'

        let storageAddressOrArtifacts: any = merkleStorageAddressSemaphore;
        if (proofType === MerkleProofType.ARTIFACTS) {

            if (!mockIdentityCommitmentsSemaphore.includes(identityCommitmentGeneric)) {
                mockIdentityCommitmentsSemaphore.push(identityCommitmentGeneric);
            }
            storageAddressOrArtifacts = {
                leaves: mockIdentityCommitmentsSemaphore,
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

    const genNRLNProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {
        const externalNullifier = genExternalNullifier('voting-1')
        const signal = '0x111'
        const rlnIdentifier = RLN.genIdentifier();
        const rlnIdentifierHex = bigintToHex(rlnIdentifier);

        let storageAddressOrArtifacts: any = merkleStorageAddressRLN;

        mockIdentityCommitmentsNRLN;

        if (proofType === MerkleProofType.ARTIFACTS) {

            if (!mockIdentityCommitmentsNRLN.includes(identityCommitmentMultipart)) {
                mockIdentityCommitmentsNRLN.push(identityCommitmentMultipart);
            }

            storageAddressOrArtifacts = {
                leaves: mockIdentityCommitmentsNRLN,
                depth: 15,
                leavesPerNode: 2
            }
        }

        let circuitPath = nrlnPath.circuitFilePath;
        let zkeyFilePath = nrlnPath.zkeyFilePath;

        try {
            
            const proof = await client.rlnProof(
                externalNullifier,
                signal,
                circuitPath,
                zkeyFilePath,
                storageAddressOrArtifacts,
                rlnIdentifierHex,
                3
            )

            console.log("NRLN proof", proof);
            toast("NRLN proof generated successfully!");
        } catch (e) {
            toast("Error while generating NRLN proof!");
            console.error(e);
        }


    };

    const genRLNProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {
        const externalNullifier = genExternalNullifier('voting-1')
        const signal = '0x111'
        const rlnIdentifier = RLN.genIdentifier();
        const rlnIdentifierHex = bigintToHex(rlnIdentifier);

        let storageAddressOrArtifacts: any = merkleStorageAddressRLN;

        if (proofType === MerkleProofType.ARTIFACTS) {

            if (!mockIdentityCommitmentsRLN.includes(identityCommitmentMultipart)) {
                mockIdentityCommitmentsRLN.push(identityCommitmentMultipart);
            }

            storageAddressOrArtifacts = {
                leaves: mockIdentityCommitmentsRLN,
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

    const getActiveIdentity = async (spamThreshold: number) => {
        const [idCommitmentGeneric, idCommitmentMultipart] = await client.getActiveIdentity(spamThreshold);
        setIdentityCommitmentGeneric(idCommitmentGeneric)
        setIdentityCommitmentMultipart(idCommitmentMultipart);
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
                const [idCommitmentGeneric, idCommitmentMultipart] = await client.getActiveIdentity(3);
                setIdentityCommitmentGeneric(idCommitmentGeneric)
                setIdentityCommitmentMultipart(idCommitmentMultipart);
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
                <h2>RLN with default spam threshold</h2>
                <button onClick={() => genRLNProof(MerkleProofType.STORAGE_ADDRESS)}>Generate proof from Merkle proof storage address</button> <br /><br />
                <button onClick={() => genRLNProof(MerkleProofType.ARTIFACTS)}>Generate proof from Merkle proof artifacts</button>
            </div>
            <hr />
            <div>
                <h2>RLN with spam threshold 3</h2>
                <button onClick={() => genNRLNProof(MerkleProofType.STORAGE_ADDRESS)}>Generate proof from Merkle storage address</button> <br /><br />
                <button onClick={() => genNRLNProof(MerkleProofType.ARTIFACTS)}>Generate proof from Merkle proof artifacts</button>
            </div>

            <hr />
            <div>
                <h2>Get identity commitment for active identity</h2>
                <button onClick={() => getActiveIdentity(2)}>ID Commitment with 2 part secret</button> <br /><br />
                <button onClick={() => getActiveIdentity(3)}>ID Commitment with 3 part secret</button>
            </div>

            <hr />
            <div>
                <h2>Identity commitments for active identity:</h2>
                <p>Generic - {identityCommitmentGeneric}</p>
                <p>Multipart - {identityCommitmentMultipart}</p>
            </div>

            <ToastContainer />
        </div>
    )
}

const root = document.getElementById('root')

ReactDOM.render(<App />, root)
