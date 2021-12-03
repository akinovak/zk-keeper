import { ZkIdentity } from '@libsem/identity'
import { SerializedIdentity, IdentityMetadata } from '@src/types'

export default class ZkIdentityDecorater {
    private zkIdentity: ZkIdentity
    private metadata: IdentityMetadata

    constructor(zkIdentity: ZkIdentity, metadata: IdentityMetadata) {
        this.zkIdentity = zkIdentity
        this.metadata = metadata
    }

    getZkIdentity = (): ZkIdentity => this.zkIdentity

    genIdentityCommitment = (): bigint => this.zkIdentity.genIdentityCommitment()

    serialize = (): string => {
        const serialized = {
            secret: this.zkIdentity.serializeIdentity(),
            metadata: this.metadata
        }

        return JSON.stringify(serialized)
    }

    static genFromSerialized = (serialized: string): ZkIdentityDecorater => {
        const data: SerializedIdentity = JSON.parse(serialized)
        if (!data.metadata) throw new Error('Metadata missing')
        if (!data.secret) throw new Error('Secret missing')

        // TODO overload zkIdentity function to work both with array and string
        const zkIdentity = ZkIdentity.genFromSerialized(data.secret)
        return new ZkIdentityDecorater(zkIdentity, data.metadata)
    }
}
