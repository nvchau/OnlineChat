var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var i18n = require('i18n');
var bodyParser = require('body-parser');
var expHbs = require('express-handlebars');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
var cors = require('cors');

const csrf = require('csurf');

// moment dùng để convert timestamp thành human time
var moment = require('moment');

var database = require('./config/database');

var homeRoute = require('./routes/homeRoute');
var chatappRoute = require('./routes/chatappRoute');

var Member = require('./models/member');

var app = express();

mongoose.Promise = global.Promise;
mongoose.connect(database.dbStr, {useMongoClient: true}, function(){
    console.log('Connected Database!');
});
mongoose.connection.on('error', function(err) {
    console.log('Error connect to Database: ' + err);
});

// moment
app.locals.moment = require('moment');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(flash());
app.use(validator());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: database.secret,
  resave: false,
  saveUninitialized: false,
  cookie : { maxAge: false }
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
  
app.use((req, res, next) => {
if (!req.session.user) {
    return next();
}

Member.findById(req.session.user._id)
    .then(user => {
        res.locals.user = user;
        next();
    })
    .catch(err => console.log(err));
});

// route
app.use('/', homeRoute);
app.use('/chatapp', chatappRoute);

//csrf token for admin
app.use(function(req, res, next) {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    next();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

module.exports = app;