import { ZkInputs } from '@src/types'

export default class ZkValidator {
    // eslint-disable-next-line class-methods-use-this
    validateZkInputs(payload: Required<ZkInputs>) {
        const { circuitFilePath, zkeyFilePath, merkleStorageAddress, merkleProofArtifacts } = payload

        if (!circuitFilePath) throw new Error('circuitFilePath not provided')
        if (!zkeyFilePath) throw new Error('zkeyFilePath not provided')

        if (!merkleStorageAddress) {
            if (!merkleProofArtifacts.leaves.length || merkleProofArtifacts.leaves.length === 0) throw new Error('invalid merkleProofArtifacts.leaves value');
            if (!merkleProofArtifacts.depth) throw new Error('invalid merkleProofArtifacts.depth value');
            if (!merkleProofArtifacts.leavesPerNode) throw new Error('invalid merkleProofArtifacts.leavesPerNode value');
        }

        return payload
    }
}
