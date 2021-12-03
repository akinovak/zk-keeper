import { IdentityMetadata } from '@src/types'
import { ZkIdentity } from '@libsem/identity'
import semethid from '@interrep/semethid'
import ZkIdentityDecorater from './identity-decorater'
import checkParameter from '@src/util/checkParameter'

const createInterrepIdentity = async (config: any): Promise<ZkIdentityDecorater> => {
    checkParameter(config, 'config', 'object')

    const { provider, nonce = 0, name, web3Info } = config

    checkParameter(name, 'name', 'string')
    checkParameter(web3Info, 'web3Info', 'object')
    checkParameter(provider, 'provider', 'string')

    const { web3, walletInfo } = web3Info

    checkParameter(web3, 'web3', 'object')
    checkParameter(walletInfo, 'walletInfo', 'object')

    const sign = (message: string) => web3.eth.sign(message, walletInfo?.account)

    const identity: ZkIdentity = await semethid(sign, provider, nonce)
    const metadata: IdentityMetadata = {
        account: walletInfo.account,
        name,
        provider: 'interrep'
    }

    return new ZkIdentityDecorater(identity, metadata)
}

const createRandomIdentity = (config: any): ZkIdentityDecorater => {
    checkParameter(config, 'config', 'object')
    checkParameter(config.name, 'name', 'string')

    const identity: ZkIdentity = new ZkIdentity()
    const metadata: IdentityMetadata = {
        account: '',
        name: config.name,
        provider: 'random'
    }

    return new ZkIdentityDecorater(identity, metadata)
}

const strategiesMap = {
    random: createRandomIdentity,
    interrep: createInterrepIdentity
}

const identityFactory = async (strategy: keyof typeof strategiesMap, config: any): Promise<ZkIdentityDecorater> =>
    strategiesMap[strategy](config)

export default identityFactory
