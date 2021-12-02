import { IdentityMetadata } from '@src/types'
import { ZkIdentity } from "@libsem/identity"
import semethid from '@interrep/semethid'
import ZkIdentityDecorater from './identity-decorater'


const createInterrepIdentity = async (option: any): Promise<ZkIdentityDecorater> => {
    const { web2Provider, nonce = 0, name, web3Info } = option

    if (typeof web2Provider === 'undefined') throw new Error('no web2Provider')
    if (typeof nonce === 'undefined') throw new Error('no nonce')

    const { web3, walletInfo } = web3Info;

    if(!web3) throw new Error("Web3 not found");
    if(!walletInfo) throw new Error("Wallet info not fould");

    const sign = (message: string) => web3.eth.sign(message, walletInfo?.account)

    const identity: ZkIdentity = await semethid(sign, web2Provider, nonce);
    const metadata: IdentityMetadata = {
        account: walletInfo.account,
        name,
        provider: 'interrep',
    };

    return new ZkIdentityDecorater(identity, metadata);
}

const createRandomIdentity = async (data: any): Promise<ZkIdentityDecorater> => {
    const identity: ZkIdentity = new ZkIdentity();
    const metadata: IdentityMetadata = {
        account: '',
        name: data.name,
        provider: 'random',
    }

    return new ZkIdentityDecorater(identity, metadata);
}


const strategiesMap = {
    random: createRandomIdentity,
    interrep: createInterrepIdentity
}

const identityFactory = async (strategy: string, options: any): Promise<ZkIdentityDecorater> => strategiesMap[strategy](options)
export default identityFactory;
