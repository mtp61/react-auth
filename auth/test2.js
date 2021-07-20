// https://www.npmjs.com/package/node-fetch#post-with-json

const { json } = require("express");
const fetch = require("node-fetch");

const url = "http://localhost:4000";

const body = {
    username: "mtpink2",
    password: "a",
};

fetch(url + "/login", {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    method: "POST"
})
    .then(data => {
        console.log(data.status)
        return data.json()
    })
    .then(json => console.log(json))
    .catch(error => console.log(error))
