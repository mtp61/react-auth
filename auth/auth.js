// https://github.com/WebDevSimplified/JWT-Authentication/blob/master/authServer.js
// https://github.com/WebDevSimplified/Nodejs-User-Authentication/blob/master/server.js
// https://expressjs.com/en/4x/api.html#res.send

require("dotenv").config('./.env');

const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const mongoose = require("mongoose");

const User = require("./models/User");

// constants
const saltRounds = 4;
const dbUser = "test-user";
const dbPass = "12345";

// setup app
app.use(cors({ origin: "*" }));
app.use(express.json());

// connect to database
mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.zng34.mongodb.net/test-db?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log("connected to database")
    })
    .catch(err => console.log(err));

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
    User.findOne({ username: username }).exec()
        .then((user) => {
            if (!user) {
                res.status(400).send({ message: `User "${username}" does not exist` });
                return;
            }
            const hashPass = user.hashPass;

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
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ message: "Database error" });
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
    User.findOne({ username: username }).exec()
        .then((user) => {
            if (user) {
                res.status(400).send({ message: `There is already a user with username "${username}"` });
                return;
            }
            // get hashed password
            bcrypt.hash(password, saltRounds, (err, hash) => {
                if (err) {
                    console.log(err);
                    res.status(500).send({ message: "Hashing error" });
                    return;
                }

                // store in database
                const user = new User({
                    username: username,
                    hashPass: hash,
                });
                
                user.save()
                    .then(() => {
                        console.log(`Added new user ${username} to database`);
                        // send token
                        res.status(200).send({ token: generateAccessToken(username) });
                    }).catch((err) => {
                        console.log(err);
                        res.status(500).send({ message: "Database error" })
                    });
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ message: "Database error" })
        });
});

app.post("/guest", (req, res) => {
    // generate a guest username
    const num = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const username = "guest-" + num;

    const token = generateAccessToken(username);

    res.status(200).send({
        username: username,
        token: token,
    });
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

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            res.status(401).send({ message: "Invalid token" });
            return;
        }
        res.status(200).send({ message: `Valid token with username "${decoded.username}"`});
    });
});

app.listen(4000);
