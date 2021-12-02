import { ZkIdentity } from '@libsem/identity'
import { createIdentity } from './'

describe('InterRep identity', () => {
    function sign(message: string) {
        return Promise.resolve(message)
    }

    describe('Create identity', () => {
        it('Should create an InterRep identity', async () => {
            const web2Provider = 'Twitter'
            const account = 'account'

            const expectedValue = await createIdentity({ web2Provider, sign, account })

            expect(expectedValue).toBeInstanceOf(ZkIdentity)
        })
    })
})
