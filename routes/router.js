const { Router } = require("express");
const passport = require("passport");
const path = require("path");
const multer = require('multer');
const accountController = require('../controllers/accountController');
const fileController = require("../controllers/fileController");

// diskStorage setup for multer to save files directly within the repository for now
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads/data')
    },
    filename:  (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const router = Router();

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

router.get('/uploadFile', fileController.uploadFileGet);
router.post('/uploadFile', upload.single('uploaded-file'), fileController.uploadFilePost);

module.exports = router;