import { Request } from '@src/types'

type Chain = {
    middlewares: Array<(payload: any) => Promise<any>>
    handler: (payload: any) => Promise<any>
}

export default class Handler {
    private handlers: Map<string, Chain>

    constructor() {
        this.handlers = new Map()
    }

    add = (method: string, ...args: Array<(payload: any) => any>) => {
        const handler = args[args.length - 1]
        const middlewares = args.slice(0, args.length - 1)
        this.handlers.set(method, { middlewares, handler })
    }

    handle = async (request: Request): Promise<any> => {
        const { method } = request
        const handler: Chain | undefined = this.handlers.get(method)
        if (!handler) throw new Error(`method: ${method} not detected`)

        let { payload } = request

        for (const middleware of handler.middlewares) {
            // eslint-disable-next-line no-await-in-loop
            payload = await middleware(payload)
        }

        return handler.handler(payload)
    }
}
