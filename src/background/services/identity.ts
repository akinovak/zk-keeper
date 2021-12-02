import { bigintToHex } from 'bigint-conversion'
import pushMessage from '@src/util/pushMessage'
import { setIdentities } from '@src/ui/ducks/identities'
import SimpleStorage from './simple-storage'
import LockService from './lock'
import ZkIdentityDecorater from '../identity-decorater'

const DB_KEY = '@@identities@@'

export default class IdentityService extends SimpleStorage {
    identities: Map<string, ZkIdentityDecorater>
    activeIdentity?: ZkIdentityDecorater

    constructor() {
        super(DB_KEY)
        this.identities = new Map()
        this.activeIdentity = undefined
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    unlock = async (_: any) => {
        const encryptedContent = await this.get()
        if (!encryptedContent) return true

        const decrypted: any = await LockService.decrypt(encryptedContent)
        await this.loadInMemory(JSON.parse(decrypted))
        await this.setDefaultIdentity()

        pushMessage(setIdentities(await this.getIdentityCommitments()))
        return true
    }

    refresh = async () => {
        const encryptedContent = await this.get()
        if (!encryptedContent) return

        const decrypted: any = await LockService.decrypt(encryptedContent)
        await this.loadInMemory(JSON.parse(decrypted))
        // if the first identity just added, set it to active
        if (this.identities.size === 1) {
            await this.setDefaultIdentity()
        }

        pushMessage(setIdentities(await this.getIdentityCommitments()))
    }

    loadInMemory = async (decrypted: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(decrypted || {}).forEach(([_, value]) => {
            const identity: ZkIdentityDecorater = ZkIdentityDecorater.genFromSerialized(value as string)
            const identityCommitment: bigint = identity.genIdentityCommitment()
            this.identities.set(bigintToHex(identityCommitment), identity)
        })
    }

    setDefaultIdentity = async () => {
        if (!this.identities.size) return

        const firstKey: string = this.identities.keys().next().value
        this.activeIdentity = this.identities.get(firstKey)
    }

    setActiveIdentity = async (identityCommitment: string) => {
        if (this.identities.has(identityCommitment)) {
            this.activeIdentity = this.identities.get(identityCommitment)
        }
    }

    getActiveidentity = async (): Promise<ZkIdentityDecorater | undefined> => this.activeIdentity

    getIdentityCommitments = async () => {
        const commitments: string[] = []
        for (const key of this.identities.keys()) {
            commitments.push(key)
        }
        return commitments
    }

    insert = async (newIdentity: ZkIdentityDecorater): Promise<boolean> => {
        const identityCommitment: string = bigintToHex(newIdentity.genIdentityCommitment())
        const existing: boolean = this.identities.has(identityCommitment)

        if (existing) return false

        const existingIdentites: string[] = []
        for (const identity of this.identities.values()) {
            existingIdentites.push(identity.serialize())
        }

        const newValue: string[] = [...existingIdentites, newIdentity.serialize()]
        const ciphertext = await LockService.encrypt(JSON.stringify(newValue))
        await this.set(ciphertext)
        await this.refresh()
        return true
    }

    getNumOfIdentites = (): number => this.identities.size
}
