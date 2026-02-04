const { Router } = require("express");
const passport = require("passport");
const controller = require('../controllers/mainController');

const router = Router();

router.get('/', controller.homepageGet);

module.exports = router;