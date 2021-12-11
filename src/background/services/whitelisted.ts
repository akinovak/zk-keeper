import { ZkInputs } from '@src/types'

const whitelistedCircuitPaths: Array<string> = [
    'http://localhost:8000/circuit.wasm',
    'http://localhost:8000/semaphore.wasm',
    'https://api.auti.sm/dev/semaphore_wasm',
]

const whitelistedKeyPaths: Array<string> = [
    'http://localhost:8000/circuit_final.zkey',
    'http://localhost:8000/semaphore_final.zkey',
    'https://api.auti.sm/dev/semaphore_final_zkey',
]

const whitelistedMerkleStorages: Array<string> = [
    'http://localhost:5000/merkle',
]

export default class ZkValidator {
    // eslint-disable-next-line class-methods-use-this
    validateZkInputs(payload: Required<ZkInputs>) {
        const { circuitFilePath, zkeyFilePath, merkleStorageAddress, merkleProof } = payload

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

        if (merkleProof) {
            if (!merkleProof.indices.length) throw new Error('merkleProof.indices must be an array');
            if (!merkleProof.pathElements.length) throw new Error('merkleProof.pathElements must be an array');
        }

        return payload
    }
}
