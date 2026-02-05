const { Router } = require("express");
const passport = require("passport");
const path = require("path");
const multer = require('multer');
const controller = require('../controllers/mainController');

// diskStorage setup for multer to save files directly within the repository for now
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/uploads/data')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({ storage: storage });

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
router.post('/uploadFile', upload.single('uploaded-file'), controller.uploadFilePost);

module.exports = router;