

class Game {
    constructor() {
        this.id =  Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

        this.players = {};
        this.observers = {};

        this.started = false;
    }

    // TODO
    update() {

    }

    addSocket(socket) {
        if (!Object.keys(this.observers).includes(socket.id)) {
            this.observers[socket.id] = socket;
        }
    }

    shouldDelete() {
        if (Object.keys(this.observers).length === 0) {
            return true;
        }
    }

    removeSocket(socket) {
        // check observer sockets
        let hasSocket = false;
        Object.keys(this.observers).forEach(id => {
            if (id === socket.id) {
                hasSocket = true;
                return;
            }
        });
        if (hasSocket) {
            return true;
        }

        // check player sockets
        Object.keys(this.players).forEach(id => {
            if (id === socket.id) {
                hasSocket = true;
                return;
            }
        });
        if (hasSocket) {
            return true;
        }

        return false;
    }
}

module.exports = Game;
