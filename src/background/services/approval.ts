import SimpleStorage from './simple-storage'
import LockService from './lock'

const DB_KEY = '@APPROVED@'

export default class ApprovalService extends SimpleStorage {
    private allowedHosts: Array<string>

    constructor() {
        super(DB_KEY)
        this.allowedHosts = new Array()
    }

    getAllowedHosts = () => {
        return this.allowedHosts
    }

    isApproved = (origin: string): boolean => {
        return this.allowedHosts.includes(origin);
    }

    unlock = async () => {
        const encrypedArray: Array<string> = await this.get()
        if (!encrypedArray) return true

        const promises: Array<Promise<string>> = encrypedArray.map((cipertext: string) => {
            return LockService.decrypt(cipertext)
        })

        this.allowedHosts = await Promise.all(promises)
    }

    refresh = async () => {
        const encrypedArray: Array<string> = await this.get()
        if (!encrypedArray) return

        const promises: Array<Promise<string>> = encrypedArray.map((cipertext: string) => {
            return LockService.decrypt(cipertext)
        })

        this.allowedHosts = await Promise.all(promises)
    }

    add = async (payload: any) => {
        const { host }: { host: string } = payload;
        if(!host) throw new Error("No host provided");

        if(this.allowedHosts.includes(host)) return;

        this.allowedHosts.push(host);

        const promises: Array<Promise<string>> = this.allowedHosts.map((host: string) => {
            return LockService.encrypt(host);
        });

        const newValue: Array<string> = await Promise.all(promises);

        await this.set(newValue);
        await this.refresh();
        console.log(this.allowedHosts);
        return;
    }


    remove = async (payload: any) => {
        const { host }: { host: string } = payload;
        if(!host) throw new Error("No address provided");

        const index: number = this.allowedHosts.indexOf(host)
        if (index === -1) return

        this.allowedHosts = [...this.allowedHosts.slice(0, index), ...this.allowedHosts.slice(index + 1)]

        const promises: Array<Promise<string>> = this.allowedHosts.map((host: string) => {
            return LockService.encrypt(host)
        })

        const newValue: Array<string> = await Promise.all(promises)
        await this.set(newValue)
        await this.refresh()
    }

    /** dev only */
    clear = async () => {
        if(!(process.env.NODE_ENV === 'DEVELOPMENT' || process.env.NODE_ENV === 'DEVELOPMENT')) return;
        return this.clear();
    }
}
