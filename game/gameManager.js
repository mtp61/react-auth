const mongoose = require("mongoose");

// db models
const GameModel = require("./models/Game");

// classes
const Game = require("./game");

// constants
const DB_USER = "test-user";
const DB_PASS = "12345";
const DELETE_TIME = 5;

class GameManager {
    constructor() {
        this.dbConnect();

        this.indexConnections = {};
        this.games = [];
        this.toDelete = {};

        // update tickrate times per second
        setInterval(this.update.bind(this), 1000);
    }

    update() {
        // update games
        this.games.forEach(game => {game.update()});

        // check to see if games should be deleted
        this.games.forEach((game, index, array) => {
            if (game.shouldDelete()) {
                if (Object.keys(this.toDelete).includes(game.id)) {
                    if (this.toDelete[game.id] == 0) {
                        array.splice(index, 1);
                    } else {
                        --this.toDelete[game.id];
                    }
                } else {
                    this.toDelete[game.id] = DELETE_TIME;
                }
            }
        });

        // send index info
        this.sendAllIndexInfo();
    }

    dbConnect() {
        mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.zng34.mongodb.net/test-db?retryWrites=true&w=majority`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
            .then(() => {
                console.log("connected to database from game manager");
            })
            .catch(err => console.log(err));
    }

    saveGame(user1, user2, result) {
        const game = new GameModel({
            user1: user1,
            user2: user2,
            result: result,
        });

        game.save()
            .then(() => {
                console.log(`Game saved -- ${user1} - ${user2} - ${result}`);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    createGame(socket) {
        const game = new Game();
        this.games.push(game);

        socket.emit("game-join", game.id);
    }

    addIndexConnection(socket) {
        if (!Object.keys(this.indexConnections).includes(socket.id)) {
            this.indexConnections[socket] = socket;
            this.sendIndexInfo(socket);
            console.log("added index connection")
        }
    }

    sendAllIndexInfo() {
        Object.keys(this.indexConnections).forEach(id => {
            this.sendIndexInfo(this.indexConnections[id]);
        });
    }

    sendIndexInfo(socket) {
        socket.emit("index-update", this.games.map(game => ({
            id: game.id,
            users: "", // TODO
            status: game.started ? "started" : "not started",
        })));
    }

    onDisconnect(socket) {
        // check for index socket
        let isIndexConnection = false;
        Object.keys(this.indexConnections).forEach(id => {
            if (id === socket.id) {
                delete this.indexConnections[id];
                isIndexConnection = true;
                return;
            }
        });
        if (isIndexConnection) {
            return;
        }

        // check for game socket
        this.games.forEach(game => {
            if (game.removeSocket(socket)) {
                return;
            }
        });
    }

    addGameConnection(socket, id) {
        
        
        // TODO
    }
}

module.exports = GameManager;
