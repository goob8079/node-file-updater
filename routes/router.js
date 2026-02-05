const { Router } = require("express");
const passport = require("passport");
const controller = require('../controllers/mainController');

const router = Router();

router.get('/', controller.homepageGet);
router.get('/signup', controller.signupPageGet);
router.post('/signup',
    controller.validateSignUp,
    controller.validateConfirmPassword,
    controller.signupPagePost
);
router.get('/login', controller.loginPageGet);
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureMessage: true
}));
router.get('/logout', controller.logoutGet);
router.get('/uploadFile', controller.uploadFileGet);

module.exports = router;