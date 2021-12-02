import SimpleStorage from './simple-storage'
import LockService from './lock'

const DB_KEY = '@APPROVED@'

export default class ApprovalService extends SimpleStorage {
    private allowedHosts: Array<string>

    constructor() {
        super(DB_KEY)
        this.allowedHosts = []
    }

    getAllowedHosts = () => this.allowedHosts

    isApproved = (origin: string): boolean => this.allowedHosts.includes(origin)

    unlock = async (): Promise<boolean> => {
        const encrypedArray: Array<string> = await this.get()
        if (!encrypedArray) return true

        const promises: Array<Promise<string>> = encrypedArray.map((cipertext: string) => LockService.decrypt(cipertext))

        this.allowedHosts = await Promise.all(promises);
        return true;
    }

    refresh = async () => {
        const encrypedArray: Array<string> = await this.get()
        if (!encrypedArray) return

        const promises: Array<Promise<string>> = encrypedArray.map((cipertext: string) => LockService.decrypt(cipertext))

        this.allowedHosts = await Promise.all(promises)
    }

    add = async (payload: any) => {
        const { host }: { host: string } = payload;
        if(!host) throw new Error("No host provided");

        if(this.allowedHosts.includes(host)) return;

        this.allowedHosts.push(host);

        const promises: Array<Promise<string>> = this.allowedHosts.map((allowedHost: string) => LockService.encrypt(allowedHost));

        const newValue: Array<string> = await Promise.all(promises);

        await this.set(newValue);
        await this.refresh();
    }


    remove = async (payload: any) => {
        const { host }: { host: string } = payload;
        if(!host) throw new Error("No address provided");

        const index: number = this.allowedHosts.indexOf(host)
        if (index === -1) return

        this.allowedHosts = [...this.allowedHosts.slice(0, index), ...this.allowedHosts.slice(index + 1)]

        const promises: Array<Promise<string>> = this.allowedHosts.map((allowedHost: string) => LockService.encrypt(allowedHost))

        const newValue: Array<string> = await Promise.all(promises)
        await this.set(newValue)
        await this.refresh()
    }

    /** dev only */
    clear = async (): Promise<any> => {
        if(!(process.env.NODE_ENV === 'DEVELOPMENT' || process.env.NODE_ENV === 'TEST')) return;
        // eslint-disable-next-line consistent-return
        return this.clear();
    }
}
