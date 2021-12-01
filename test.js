const { randomUUID } = require("crypto");
const EventEmitter2 = require("eventemitter2");

class SquareResolution extends EventEmitter2 {
    constructor() {
        super();
    }

    listenOnNewPopup = () => {
        this.on('new-popup', (listenerId) => {
            //OPEN NEW POPUP AND WHEN BUTTON IS CLICKED SEND THIS LISTENER ID
        })
    }

    trySquare = (x) => {
        const randomId = randomUUID();
        this.emit('new-popup', randomId);
        return new Promise((resolve, reject) => {

            this.once(randomId, (action) => {
                if(action === 'yes') resolve(x * x)
                else reject(-1);
            })
        })
    }
}