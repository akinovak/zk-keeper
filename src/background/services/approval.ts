import SimpleStorage from "./simple-storage";
import LockService from "./lock";

const DB_KEY = '@APPROVED@';

export default class ApprovalService extends SimpleStorage {
    private allowedHosts: Array<string>;

    constructor() {
        super(DB_KEY);
        this.allowedHosts = new Array();
    }

    getAllowedHosts = () => {
        return this.allowedHosts;
    }

    unlock = async () => {
        const encrypedArray: Array<string> = await this.get();
        if(!encrypedArray) return true;

        const promises: Array<Promise<string>> = encrypedArray.map((cipertext: string) => {
            return LockService.decrypt(cipertext);
        });

        this.allowedHosts = await Promise.all(promises);
    }

    refresh = async () => {
        const encrypedArray: Array<string> = await this.get();
        if(!encrypedArray) return;

        const promises: Array<Promise<string>> = encrypedArray.map((cipertext: string) => {
            return LockService.decrypt(cipertext);
        });

        this.allowedHosts = await Promise.all(promises);
    }

    add = async (host: string) => {
        if(!host) throw new Error("No address provided");

        if(this.allowedHosts.includes(host)) return;

        const newValue: Array<string> = [...this.allowedHosts, host];
        await this.set(newValue);

        await this.refresh();
        return;
    }

    remove = async (host: string) => {
        if(!host) throw new Error("No address provided");

        const index: number = this.allowedHosts.indexOf(host);
        if(index === -1) return;

        this.allowedHosts = [...this.allowedHosts.slice(0, index), ...this.allowedHosts.slice(index + 1)];

        const promises: Array<Promise<string>> = this.allowedHosts.map((host: string) => {
            return LockService.encrypt(host);
        });

        const newValue: Array<string> = await Promise.all(promises);
        await this.set(newValue);
        await this.refresh();
    }

}