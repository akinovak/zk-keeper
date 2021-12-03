import ZkIdentityDecorater from './identity-decorater'
import identityFactory from './identity-factory'

describe('# identityFactory', () => {
    it('Should not create a random identity without the required parameters', async () => {
        const fun = () => identityFactory('random', undefined as any)

        await expect(fun).rejects.toThrow("Parameter 'config' is not defined")
    })

    it('Should create a random identity', async () => {
        const identity1 = await identityFactory('random', { name: 'name' })
        const identity2 = ZkIdentityDecorater.genFromSerialized(identity1.serialize())

        expect(identity1.zkIdentity.getIdentity()).toEqual(identity2.zkIdentity.getIdentity())
    })

    it('Should not create an InterRep identity without the required parameters', async () => {
        const fun = () => identityFactory('interrep', undefined as any)

        await expect(fun).rejects.toThrow()
    })
})
