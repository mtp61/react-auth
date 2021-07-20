// https://stackoverflow.com/questions/36788831/authenticating-socket-io-connections-using-jwt

const PORT = 5000;

require("dotenv").config('./.env');

const jwt = require("jsonwebtoken");

// create server
const httpServer = require('http').createServer();
const io = require('socket.io')(httpServer, {
    cors: {
        origin: '*',
    },
});

// use authentication
io.use((socket, next) => {
    if (socket.handshake.auth && socket.handshake.auth.token) {
        jwt.verify(socket.handshake.auth.token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                console.log("Auth error -- bad token");
                return next(new Error("Auth error -- bad token"));
            } else {
                console.log("Auth success");
                socket.decoded = decoded;
                next();
            }
        });
    } else {
        console.log("Auth error -- missing token");
        return next(new Error("Auth error -- missing token"));
    }
}).on('connection', socket => {
    // print when there's a connection or new data
    console.log(`connection: ${socket.id}`)

    socket.on('message', (message) => {
        io.emit('message', message);
        
        // console.log(message);
    });

    socket.onAny((event, ...args) => {
        console.log(event, args);
    });
});

// start the server
httpServer.listen(PORT);
console.log('starting server on port ' + PORT);
