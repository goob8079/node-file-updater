const express = require("express");
const path = require("node:path");
const session = require("express-session");
const passport = require("passport");
const router = require('./routes/router');
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("./generated/prisma/client");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
require("dotenv/config");

const app = express();

// prisma sesison store setup
const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

app.use(
    session({
        cookie: { maxAge: 7 * 24 * 60 * 60 * 1000}, 
        secret: process.env.COOKIE_SECRET,
        resave: true,
        saveUninitialized: true,
        store: new PrismaSessionStore(
            prisma,
            {
                checkPeriod: 2 * 60 * 1000,
                dbRecordIdIsSessionId: true,
                dbRecordIdFunction: undefined,
            }
        )
    })
);
require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

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