var express = require('express');
var router = express.Router();

var cookieParser = require('cookie-parser');
var session = require('express-session');
var path = require('path');

router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(express.static(path.join(__dirname, '../public')));

router.use(cookieParser());
router.use(session({
  secret: 'sessi0nS3cr3t',
  saveUninitialized: true,
  resave: false
}));

router.get('/', function(req, res, next) {
  res.locals.user = req.session.user;
  console.log(res.locals.user, req.session.user)
  res.render('index', { title: 'Chat App' });
});

router.post('/', function(req, res, next) {
  res.locals.user = req.session.user = req.body.username;
  res.redirect("/")
});

module.exports = router;
