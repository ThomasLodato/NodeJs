var express = require('express');
var router = express.Router();
var passport = require('passport');
var authenticate = require('../authenticate');

const bodyParser = require('body-parser');
var User = require('../models/users');

router.use (bodyParser.json());

/* GET users listing. */
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, function(req, res, next) {
	User.find({})
	.then((users) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(users);
	}, (err) => next(err))
	.catch((err) => next(err));
});

router.post('/signup', (req, res, next) => {
	User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
		if (err) {
			res.statusCode = 500;
			res.setHeader('Content-Type', 'application/json');
			res.json({err: err});
		}
		else {
			if (req.body.firstname)
				user.firstname = req.body.firstname;
			if (req.body.lastname)
				user.lastname = req.body.lastname;
			user.save((err, user) => {
				if (err) {
					res.statusCode = 500;
					res.setHeader('Content-Type', 'application/json');
					res.json({err: err});
					return;
				}
				passport.authenticate('local')(req, res, () => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json({succes: true, status: 'Registration Succesful', user: user});
			});
			});
		}
	});
});

router.post('/login', passport.authenticate('local'), (req, res) => {
	var token = authenticate.getToken({_id: req.user._id});
	res.status = 200;
	res.setHeader('Content-Type', 'application/json');
	res.json({succes: true, token: token, status: 'You are Succesfully logged in'});
});

router.get('/logout', (req, res) => {
	if (req.session) {
		req.session.destroy();
		res.clearCookie('session-id', {httpOnly:true, path:"/"});
		res.redirect('/');
	}
	else {
		var err = new Error('You are not logged in');
		err.status = 403;
		next(err);
	}
});

module.exports = router;
