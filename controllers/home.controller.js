var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

var Member = require('../models/member');

exports.index = (req, res, next) => {
    res.render('frontend/home/index', {
        pageTitle: 'WebChat'
    })
    .catch(err => console.log(err));
}

exports.login = (req, res, next) => {
    let messages = req.flash('error');
    if (messages.length > 0) {
        messages = messages[0];
    } else {
        messages = null;
    }
    res.render('frontend/home/login', {
        pageTitle: 'WebChat/Login',
        errorMessage: messages,
    });
}

exports.postLogin = (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    Member.findOne({
        'local.email': email
    })
    .then(user => {
        if (!user) {
        req.flash('error', 'Invalid email.');
        return res.redirect('/login');
        }
        bcrypt
        .compare(password, user.local.password)
        .then(doMatch => {
            if (doMatch) {
                req.session.isLoggedIn = true;
                req.session.user = user;
                // tự động đăng nhập sau khi đăng ký
                return req.session.save(err => {
                    if (err) console.log(err);
                    res.redirect('/chatapp');
                });
            }
            req.flash('error', 'Invalid password.');
            res.redirect('/login');
        })
        .catch(err => {
            console.log(err);
            res.redirect('/login');
        });
    })
    .catch(err => console.log(err));
}

exports.getLogout = (req, res) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/login');
    });
}

exports.register = (req, res, next) => {
    let messages = req.flash('error');
    if (messages.length > 0) {
        messages = messages[0];
    } else {
        messages = null;
    }
    res.render('frontend/home/register', {
        pageTitle: 'WebChat/Register',
        errorMessage: messages
    });
}

exports.postRegister = (req, res) => {
    const firtname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmpassword;

    Member.findOne({
        'local.email': email
      })
      .then(user => {
        if (user) {
          req.flash('error', 'Mail exists already, please pick a different one.');
          return res.redirect('/register');
        }
        if (password !== confirmPassword) {
          req.flash('error', 'Password not match.');
          return res.redirect('/register');
        }
        return bcrypt.hash(password, 5)
        .then(hashedPassword => {
        var newMember = new Member();
        newMember.info.firstname = firtname;
        newMember.info.lastname = lastname;
        newMember.local.email = email;
        newMember.local.password = hashedPassword;
        newMember.image_path = 'images/avatar/avatar-user.png';
        newMember.roles = 'MEMBER';
        newMember.status = 'ACTIVE';

        newMember.save(function(err, user) {
            if (err) {
                console.log(err);
            } else {
                // Tự động đăng nhập cho thành viên mới đăng ký
                req.session.isLoggedIn = true;
                req.session.user = user;
                return req.session.save(err => {
                    if (err) console.log(err);
                    res.redirect('/chatapp');
                });
            }
        });
        })
    })
    .catch(err => {
    console.log(err);
    });
}

exports.profile = (req, res, next) => {
    res.render('frontend/home/profile', {
        pageTitle: 'WebChat/Profile',
    })
    .catch(err => console.log(err));
}
