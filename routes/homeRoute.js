var express = require('express');
var router = express.Router();

var home_controller = require('../controllers/home.controller');
var passport = require('../config/passport');

const multer = require('multer');
// const csrf = require('csurf');

// const csrfProtection = csrf();
// router.use(csrfProtection);

// home -> login
router.get('/', passport.notLoggedIn, home_controller.login);

/* Upload File - upload image for change-avatar */
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads/avatar-user/')
    },
    filename: (req, file, cb) => {
        let filename = file.originalname;
        cb(null, Date.now() + '-' + filename)
    },
    fileFilter: (req, file, callback) => {
        let ext = path.extname(file.originalname)
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            return callback(null, false)
        }
        callback(null, true)
    }
});

let upload = multer({
  storage: storage,
  limits: { fileSize: '4MB' }
});

router.get('/login', passport.notLoggedIn, home_controller.login);
router.post('/login', home_controller.postLogin);

router.get('/logout', passport.isLoggedIn, home_controller.getLogout);

router.get('/register', passport.notLoggedIn, home_controller.register);
router.post('/register', passport.notLoggedIn, home_controller.postRegister);

router.get('/profile', passport.isLoggedIn, home_controller.getProfile);
router.post('/profile/edit-profile', upload.single('image_path'), home_controller.postEditProfile);

router.get('/changepassword', passport.isLoggedIn, home_controller.getChangePassword);
router.post('/changepassword', passport.isLoggedIn, home_controller.postChangePassword);

module.exports = router;