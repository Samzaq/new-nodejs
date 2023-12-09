const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const pg = require("pg");
const bcrypt = require('bcrypt');
require('dotenv').config()
const saltRounds = 10;

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true,
}))

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "postgres",
    password: "sang",
    port: 5432,
})

db.connect();

app.get("/", function (req, res) {
    res.render("home");
})


app.get("/login", function (req, res) {
    res.render("login");
})


app.get("/register", function (req, res) {
    res.render("register");
})

app.post("/register", async function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    try {
        bcrypt.hash(password, saltRounds).then(async function (hash) {
            await db.query("INSERT INTO users values ($1, $2)", [username, hash]);
            res.render("secrets")
        });
    } catch (err) {
        console.log(err)
        res.redirect("/register")
    }
})

app.post("/login", async function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    try {
        const pass = await db.query("SELECT password FROM users where email = $1", [username])
        const result = pass.rows;

        if (result.length > 0) {
            bcrypt.compare(password, result[0].password).then(function (result) {
                if (result == true) {
                    res.render("secrets")
                } else {
                    res.redirect("/login")
                }
            });

        }
    } catch (err) {
        res.redirect("/login")
    }
})

app.listen(3000, function () {
    console.log(process.env.yes)
})