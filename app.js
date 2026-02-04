const express = require("express");
const path = require("node:path");
const session = require("express-session");
const passport = require("passport");
const router = require('./routes/router');
require("dotenv/config");

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use('/', router);

const PORT = process.env.PORT || 8000
app.listen(PORT, (err) => {
    if (err) {
        throw err;
    }
    console.log(`App listening on port ${PORT}`);
});