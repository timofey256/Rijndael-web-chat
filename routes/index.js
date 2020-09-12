const express = require('express');
const router = express.Router();

const config = require('../settings');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');

router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(express.static(path.join(__dirname, '../public')));

router.use(cookieParser());
router.use(session({
  secret: config.sessionSecretKey,
  saveUninitialized: true,
  resave: false
}));

router.get('/', function(req, res) {
  res.locals.user = req.session.user;
  console.log(res.locals.user, req.session.user)
  res.render('index', { title: 'Chat App' });
});

router.post('/', function(req, res) {
  res.locals.user = req.session.user = req.body.username;
  res.redirect("/")
});

module.exports = router;