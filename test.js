const a = (request) => {
    console.log('a');
    return request;
}

const b = (request) => {
    console.log('b');
    return request;
}

const c = (request) => {
    console.log('c');
    return request;
}

const square = (request) => {
    const { x } = request;
    return x * x;
}

class App {
    handlers = {};

    constructor() {}

    add(rpc, middlewares, handler) {
        this.handlers[rpc] = { middlewares: middlewares, handler }
    }

    handle(rpc, data) {
        const handler = this.handlers[rpc];

        if(!handler) return;

        let request = data;

        for(let middleware of handler.middlewares) {
            request = middleware(request);
        }

        return handler.handler(request);
    }
}

const app = new App();

app.add('nesto', [a, b, c], square);
app.add('nesto2', [b, c], square);

const response = app.handle('nesto', { x: 3 } );

const response2 = app.handle('nesto2', { x: 5 } );


console.log(response);
console.log(response2);
