const { Router } = require("express");
const passport = require("passport");
const indexController = require('../controllers/indexController');
const accountController = require('../controllers/accountController');
const fileController = require('../controllers/fileController');
const folderController = require('../controllers/folderController');
const upload = require("../config/multer");

const router = Router();

// account logic
router.get('/', indexController.homepageGet);
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

// file logic
router.get('/uploadFile', fileController.uploadFileGet);
router.post('/uploadFile', upload.single('uploaded-file'), fileController.uploadFilePost);

// folder logic
router.get('/folder/:id', folderController.viewFolderGet);
router.post('/folder/:id/rename',
    folderController.validateFolderName,
    folderController.renameFolderPost
);

module.exports = router;