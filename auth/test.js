// https://www.npmjs.com/package/bcrypt

const bcrypt = require("bcrypt");

const saltRounds = 4;

// testing
const h = bcrypt.hash("a", saltRounds, (err, hash) => {
    if (err) {
        console.log("fail")
    } else {
        console.log("success")
        console.log(hash)
    }
});

// console.log(h)

bcrypt.compare("a", "$2b$04$Vlrnv/6e5cMeM7SEgXvDDOLWpZxKhArdzuRfQxhyOT5pXRXoHu9y6", (err, result) => {
    console.log(result)
})