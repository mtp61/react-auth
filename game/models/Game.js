const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
    user1: {
        type: String,
        required: true
    },
    user2: {
        type: String,
        required: true
    },
    result: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
});

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;
