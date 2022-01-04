import { ZkInputs } from '@src/types'

const whitelistedCircuitPaths: Array<string> = [
    'http://localhost:8000/circuit.wasm',
    'http://localhost:8000/semaphore.wasm',
    'http://localhost:8000/rln.wasm',
    'http://localhost:8000/semaphore/semaphore.wasm',
    'http://localhost:8000/rln_default/rln.wasm',
    'http://localhost:8000/rln_3/rln.wasm',
    'https://api.auti.sm/dev/semaphore_wasm',


]

const whitelistedKeyPaths: Array<string> = [
    'http://localhost:8000/circuit_final.zkey',
    'http://localhost:8000/semaphore_final.zkey',
    'http://localhost:8000/rln_final.zkey',
    'http://localhost:8000/semaphore/semaphore_final.zkey',
    'http://localhost:8000/rln_default/rln_final.zkey',
    'http://localhost:8000/rln_3/rln_final.zkey',
    'https://api.auti.sm/dev/semaphore_final_zkey',
]

const whitelistedMerkleStorages: Array<string> = [
    'http://localhost:5000/merkle',
    'http://localhost:8090/merkle',
    'http://localhost:8090/merkleProofRLN',
    'http://localhost:8090/merkleProofSemaphore',
]

export default class ZkValidator {
    // eslint-disable-next-line class-methods-use-this
    validateZkInputs(payload: Required<ZkInputs>) {
        const { circuitFilePath, zkeyFilePath, merkleStorageAddress, merkleProofArtifacts } = payload

        if (!circuitFilePath) throw new Error('circuitFilePath not provided')
        if (!zkeyFilePath) throw new Error('zkeyFilePath not provided')

        const circutiValid = whitelistedCircuitPaths.includes(circuitFilePath)
        if (!circutiValid) throw new Error(`${circuitFilePath} is not whitelisted`)

        const zkeyValid = whitelistedKeyPaths.includes(zkeyFilePath)
        if (!zkeyValid) throw new Error(`${zkeyFilePath} is not whitelisted`)

        if (merkleStorageAddress) {
            const merkleStorageValid = whitelistedMerkleStorages.includes(merkleStorageAddress)
            if (!merkleStorageValid) throw new Error(`${merkleStorageAddress} is not whitelisted`)
        }

        if (!merkleStorageAddress) {
            if (!merkleProofArtifacts.leaves.length || merkleProofArtifacts.leaves.length === 0) throw new Error('invalid merkleProofArtifacts.leaves value');
            if (!merkleProofArtifacts.depth) throw new Error('invalid merkleProofArtifacts.depth value');
            if (!merkleProofArtifacts.leavesPerNode) throw new Error('invalid merkleProofArtifacts.leavesPerNode value');
        }

        return payload
    }
}
