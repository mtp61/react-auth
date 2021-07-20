// https://github.com/WebDevSimplified/JWT-Authentication/blob/master/authServer.js
// https://github.com/WebDevSimplified/Nodejs-User-Authentication/blob/master/server.js
// https://expressjs.com/en/4x/api.html#res.send

require("dotenv").config();

const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");

app.use(cors({ origin: "*" }));
app.use(express.json());

const saltRounds = 4;

// TODO use a database
const users = [
    {
        username: "mtpink",
        hashPass: "$2b$04$Vlrnv/6e5cMeM7SEgXvDDOLWpZxKhArdzuRfQxhyOT5pXRXoHu9y6", // "a"
    },
];

const generateAccessToken = username => jwt.sign(
    {username: username}, 
    process.env.ACCESS_TOKEN_SECRET
);

app.post("/login", (req, res) => {
    const requiredKeys = ["username", "password"];
    if (!requiredKeys.every(key => {
        if (!Object.keys(req.body).includes(key)) {
            res.status(400).send({ message: `Missing body param ${key}` });
            return false;
        }
        return true;
    })) {
        return;
    }

    const username = req.body.username;
    const password = req.body.password;

    // check for user
    let hasUser = false;
    let hashPass;
    users.forEach(user => {
        if (user.username === username) {
            hasUser = true;
            hashPass = user.hashPass;
        }
    });
    if (!hasUser) {
        res.status(400).send({ message: `User "${username}" does not exist` });
        return;
    }

    // check password
    bcrypt.compare(password, hashPass, (err, result) => {
        if (err) {
            console.log(`bcrypt.compare error: ${err}`);
            res.status(500).send({ message: "Internal Server Error" });
            return;
        }

        if (!result) {
            res.status(401).send({ message: "Incorrect Password" });
            return;
        }
        
        res.status(200).send({ token: generateAccessToken(username) });
    });
});

app.post("/signup", (req, res) => {
    const requiredKeys = ["username", "password"];
    if (!requiredKeys.every(key => {
        if (!Object.keys(req.body).includes(key)) {
            res.status(400).send({ message: `Missing body param ${key}` });
            return false;
        }
        return true;
    })) {
        return;
    }

    const username = req.body.username;
    const password = req.body.password;

    // TODO make sure username and password are valid
    if (username.length === 0) {
        res.status(400).send({ message: "Username must be at least one character" });
        return;
    } else if (password.length === 0) {
        res.status(400).send({ message: "Password must be at least one character" });
        return;
    }

    // make sure there aren't any users with the same name
    if (!users.every(user => user.username !== username)) {
        res.status(400).send({ message: `There is already a user with username "${username}"` });
        return;
    }

    // store username as password
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.log(err);
            res.status(500).send({ message: "Internal server error" });
            return;
        }

        users.push({
            username: username,
            hashPass: hash,
        })

        // send token
        res.status(200).send({ token: generateAccessToken(username) });
    })
});

app.post("/checktoken", (req, res) => {
    const requiredKeys = ["token"];
    if (!requiredKeys.every(key => {
        if (!Object.keys(req.body).includes(key)) {
            res.status(400).send({ message: `Missing body param ${key}` });
            return false;
        }
        return true;
    })) {
        return;
    }

    const token = req.body.token;

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        res.status(200).send({ message: `Valid token with username "${decoded.username}"`})
    } catch (err) {
        res.status(401).send({ message: "Invalid token" });
        return;
    }
});

app.listen(4000);
