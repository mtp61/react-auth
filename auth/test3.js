const jwt = require("jsonwebtoken");

require("dotenv").config('../.env');

console.log(process.env.ACCESS_TOKEN_SECRET)

const token = jwt.sign(
    {username: "mtpink"}, 
    process.env.ACCESS_TOKEN_SECRET
);

jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
        console.log("here1")
    } else {
        console.log("here2")
    }
});