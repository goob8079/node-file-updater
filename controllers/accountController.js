const { validationResult, body } = require("express-validator");
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
require("dotenv/config");

const validateSignUp = [
    body('username').trim()
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must contain only letters and numbers!')
        .isLength({ min: 1, max: 25 }).withMessage('Username must be between 1 and 25 characters long!'),
    body('email').trim()
        .isEmail().withMessage('Invalid email address'),
    body('password').trim()
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters!')
];

const validateConfirmPassword = body('confirmPass')
    .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords must be matching!');
        }
        return true;
    });

async function homepageGet(req, res) {
    res.render('index', {
        loggedIn: req.isAuthenticated(),
        user: req.user?.username ?? null    
    });
}

async function signupPageGet(req, res) {
    res.render('signup', {
        errors: [],
        old: ''
    });
}

async function signupPagePost(req, res, next) {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
        return res.status(400).render('signup', {
            errors: errs.array(),
            old: req.body
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await prisma.user.create({
            data: {
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword
            }
        });
        res.redirect('/');
    } catch (error) {
        console.log(error);
        next(error)
    }
}

async function loginPageGet(req, res) {
    const messages = req.session?.messages || [];

    if (req.session) {
        req.session.messages = [];
    }

    res.render('login', {
        authErrors: messages,
        old: ''
    });
}

async function logoutGet(req, res, next) {
    req.logout(err => {
        if (err) {
            return next(err);
        }
    });
    res.redirect('/');
}

module.exports = {
    homepageGet,
    signupPageGet,
    signupPagePost,
    loginPageGet,
    logoutGet,
    validateSignUp,
    validateConfirmPassword,
}