import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { genExternalNullifier, RLN } from '@zk-kit/protocols'
import { bigintToHex } from 'bigint-conversion'
import { ZkIdentity } from '@zk-kit/identity'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const semaphorePath = {
    circuitFilePath: "http://localhost:8095/semaphore/semaphore.wasm",
    zkeyFilePath: "http://localhost:8095/semaphore/semaphore_final.zkey"
};

const rlnPath = {
    circuitFilePath: "http://localhost:8095/rln/rln.wasm",
    zkeyFilePath: "http://localhost:8095/rln/rln_final.zkey"
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

const getIdentityCommitments = (): string[] => {

    const idCommitments = [
        "2e3d66df1f13903f6f76b45054dd7315946cb72eb45564166040f6c7d883b384",
        "20acb75e6fbe673a335d75b3c7c8c9197aef82d8e9f5eef1c8a06036d5be11db",
        "b8f4b62d6f0ce0e183bb52a7a53e5dc21d9f4e512402a3b7f7be15825ab08f4",
        "22d305c5a675e98e108f7083a4f666279dc3a4e0c25b83112558b620d2baa2e4",
        "15b2aa82d6f78a058804c6e43d5f5e55af257ea543b2cf6b4001db5bf861f23f",
        "2707736ead0d877883d85d77bcd2facefbdd717b1ecc3b91e08d3238e49d3d62",
        "63f426004a5a3977e2dc711f30f9fdf5674a6479c4d3b67ebf4034bc56296e6",
        "1c36cb07e1010211f2ec97ae784dca4b70e9de53f4e91cfbf97269353fcb0540",
        "20acb75e6fbe673a335d75b3c7c8c9197aef82d8e9f5eef1c8a06036d5be11db",
        "2e3d66df1f13903f6f76b45054dd7315946cb72eb45564166040f6c7d883b384",
        "7560f3a902724aeb04564fb2afd9c8dab41299d5d7616aa5fd3b655fb3ba6cd",
        "20acb75e6fbe673a335d75b3c7c8c9197aef82d8e9f5eef1c8a06036d5be11db",
        "b8f4b62d6f0ce0e183bb52a7a53e5dc21d9f4e512402a3b7f7be15825ab08f4",
        "22d305c5a675e98e108f7083a4f666279dc3a4e0c25b83112558b620d2baa2e4",
        "1a665a9ac43fba604f3e7e8b0478a782143c6285199e0f6c1b8378b6a4399b10",
        "15b2aa82d6f78a058804c6e43d5f5e55af257ea543b2cf6b4001db5bf861f23f",
        "aeca115feebac02d4699835ffd4d488d81c1397fa164b2e5ddfac41632f85d2",
        "ebcd7ad5a36cb021449a17d4e7a6277a9397911493e6df48bbb2b10dc8cb7da",
        "1e7eae8b3f499ebfff0d07601e0b8e5882263d4e298ae4694465b822cf4192b2",
        "2e9ef686adac2906c51ce233527d2c0e70036317ab8319bbf602e885f1d69dc3",
        "fec9104b75e340b331c04d797569c63df498eec08c7b6575a4d1b2d29431787",
        "fec9104b75e340b331c04d797569c63df498eec08c7b6575a4d1b2d29431787"
    ]
    return idCommitments;
}

function App() {


    const [client, setClient] = useState(null);
    const [identityCommitment, setIdentityCommitment] = useState("");
    const mockIdentityCommitments: string[] = genMockIdentityCommitments();

    const genSemaphoreProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {

        const externalNullifier = genExternalNullifier('voting-1')
        const signal = '0x111'

        let storageAddressOrArtifacts: any = `${merkleStorageAddress}/Semaphore`;
        if (proofType === MerkleProofType.ARTIFACTS) {

            if (!mockIdentityCommitments.includes(identityCommitment)) {
                mockIdentityCommitments.push(identityCommitment);
            }
            storageAddressOrArtifacts = {
                leaves: mockIdentityCommitments,
                depth: 20,
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

        let storageAddressOrArtifacts: any = `${merkleStorageAddress}/RLN`;

        const idCommitments = getIdentityCommitments()

        if (proofType === MerkleProofType.ARTIFACTS) {

            if (!idCommitments.includes(identityCommitment)) {
                idCommitments.push(identityCommitment);
            }

            storageAddressOrArtifacts = {
                leaves: idCommitments,
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
            const { zkpr } = window as any
            const client = await zkpr.connect()
            setClient(client);

            await client.on("identityChanged", (idCommitment) => {
                setIdentityCommitment(idCommitment);
            })

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
