const { Router } = require("express");
const passport = require("passport");
const accountController = require('../controllers/accountController');
const fileController = require("../controllers/fileController");
const upload = require("../config/multer");

const router = Router();

// account logic
router.get('/', accountController.homepageGet);
router.get('/signup', accountController.signupPageGet);
router.post('/signup',
    accountController.validateSignUp,
    accountController.validateConfirmPassword,
    accountController.signupPagePost
);
router.get('/login', accountController.loginPageGet);
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureMessage: true
}));
router.get('/logout', accountController.logoutGet);

// file uploading logic
router.get('/uploadFile', fileController.uploadFileGet);
router.post('/uploadFile', upload.single('uploaded-file'), fileController.uploadFilePost);

module.exports = router;