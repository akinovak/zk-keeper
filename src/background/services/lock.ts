import CryptoJS from 'crypto-js'
import SimpleStorage from './simple-storage'

const passwordKey: string = '@password@'

class LockService extends SimpleStorage {
    private isUnlocked: boolean
    private password?: string
    private passwordChecker: string

    constructor() {
        super(passwordKey)
        this.isUnlocked = false
        this.password = undefined
        this.passwordChecker = 'Password is correct'
    }

    /**
     *  This method is called when install event occurs
     */
    setupPassword = async (password: string) => {
        const ciphertext: string = CryptoJS.AES.encrypt(this.passwordChecker, password).toString()
        await this.set(ciphertext)
        await this.unlock({ password })
    }

    unlock = async (payload: any): Promise<boolean> => {
        if (this.isUnlocked) return true
        const ciphertext = await this.get()
        if (!ciphertext) throw new Error('Something badly gone wrong (reinstallation probably required)')

        if (!payload) throw new Error('Payload is empty')
        const { password }: { password: string } = payload
        if (!password) throw new Error('Password is not provided')

        const bytes = CryptoJS.AES.decrypt(ciphertext, password)
        const retrievedPasswordChecker: string = bytes.toString(CryptoJS.enc.Utf8)

        if (retrievedPasswordChecker !== this.passwordChecker) throw new Error('Incorect password')

        this.password = password
        this.isUnlocked = true

        return true
    }

    logout = async (): Promise<boolean> => {
        this.isUnlocked = false
        this.password = undefined
        return true
    }

    ensure = async (payload: any = null) => {
        if (!this.isUnlocked || !this.password) throw new Error('state is locked!');
        return payload
    }

    encrypt = async (payload: string): Promise<string> => {
        await this.ensure()
        return CryptoJS.AES.encrypt(payload, this.password).toString()
    }

    decrypt = async (ciphertext: string): Promise<string> => {
        await this.ensure()
        const bytes = CryptoJS.AES.decrypt(ciphertext, this.password)
        return bytes.toString(CryptoJS.enc.Utf8)
    }
}

export default new LockService()
