import { ZkInputs } from "@src/types";

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

export default class ZkValidator {
    validateZkInputs(payload: Required<ZkInputs>) {
        const { circuitFilePath, zkeyFilePath, merkleStorageAddress } = payload;

        if(!circuitFilePath) throw new Error("circuitFilePath not provided");
        if(!zkeyFilePath) throw new Error("zkeyFilePath not provided");

        const circutiValid = whitelistedCircuitPaths.includes(circuitFilePath);
        if(!circutiValid) throw new Error(`${circuitFilePath} is not whitelisted`);

        const zkeyValid = whitelistedKeyPaths.includes(zkeyFilePath);
        if(!zkeyValid) throw new Error(`${zkeyFilePath} is not whitelisted`);

        if(merkleStorageAddress) {
            const merkleStorageValid = whitelistedMerkleStorages.includes(merkleStorageAddress);
            if(!merkleStorageValid) throw new Error(`${merkleStorageAddress} is not whitelisted`);
        }

        return payload;
    }
}