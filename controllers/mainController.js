const passport = require("passport");
const bcrypt = require("bcryptjs");
require("dotenv/config");

async function homepageGet(req, res) {
    res.render('index');
}

module.exports = {
    homepageGet,
}