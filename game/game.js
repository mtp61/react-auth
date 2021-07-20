const PORT = 5000;

// create server
const httpServer = require('http').createServer();
const io = require('socket.io')(httpServer, {
    cors: {
        origin: '*',
    },
});

// print when there's a connection or new data
io.on('connection', socket => {
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
