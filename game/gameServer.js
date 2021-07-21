// https://stackoverflow.com/questions/36788831/authenticating-socket-io-connections-using-jwt

require("dotenv").config('./.env');
const jwt = require("jsonwebtoken");

const GameManager = require("./gameManager");

// constants
const PORT = 5000;

// create server
const httpServer = require('http').createServer();
const io = require('socket.io')(httpServer, {
    cors: {
        origin: '*',
    },
});

// create the game manager
const gameManager = new GameManager();

// use authentication
io.use((socket, next) => {
    if (socket.handshake.auth && socket.handshake.auth.token) {
        jwt.verify(socket.handshake.auth.token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                console.log("Auth error -- bad token");
                return next(new Error("Auth error -- bad token"));
            } else {
                // console.log("Auth success");
                socket.decoded = decoded;
                next();
            }
        });
    } else {
        console.log("Auth error -- missing token");
        return next(new Error("Auth error -- missing token"));
    }
})
    .on('connection', socket => {
        // print when there's a connection or new data
        console.log(`connection -- ${socket.decoded.username}, ${socket.id}`)

        socket.onAny((event, ...args) => {
            console.log(event, args);
        });

        // event handlers
        socket.on("connect-index", onConnectIndex);
        socket.on("create-game", onCreateGame);
        socket.on("connect-game", onConnectGame);
        socket.on("game-event", onGameEvent);
        socket.on("disconnect", onDisconnect);
    });

function onConnectIndex() {
    gameManager.addIndexConnection(this);
}

function onCreateGame() {
    gameManager.createGame(this);
}

// TODO
function onConnectGame() {

}

// TODO
function onGameEvent() {

}

function onDisconnect() {
    console.log(`disconnect -- ${this.decoded.username}, ${this.id}`);
    gameManager.onDisconnect(this);
}

// start the server
httpServer.listen(PORT);
console.log('starting server on port ' + PORT);
