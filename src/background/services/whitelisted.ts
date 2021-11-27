const whitelistedCircuitPaths: Array<string> = [
    'http://localhost:8000/circuit.wasm',
    'http://localhost:8000/semaphore.wasm'
]

const whitelistedKeyPaths: Array<string> = [
    'http://localhost:8000/circuit_final.zkey',
    'http://localhost:8000/semaphore_final.zkey',
]

const whitelistedMerkleStorages: Array<string> = [
    'http://localhost:5000/merkle',
]

export function validCircuit(circuitFilePath: string): boolean {
    return whitelistedCircuitPaths.includes(circuitFilePath);
}

export function validZkey(finalZkeyPath: string): boolean {
    return whitelistedKeyPaths.includes(finalZkeyPath);
}

export function validMerkleStorage(whitelistedMerkleStorage: string) {
    return whitelistedMerkleStorages.includes(whitelistedMerkleStorage);
}
