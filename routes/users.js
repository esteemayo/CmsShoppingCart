const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');

const User = require('../models/User');


// GET REGISTER
router.get('/register', (req, res) => {
    res.render('register', {
        title: 'Register'
    });
});

// POST REGISTER
router.post('/register', (req, res) => {
    const { name, email, username, password, password2 } = req.body;
    let errors = [];

    if (!name) {
        errors.push({ msg: 'Name is required!' });
    }

    if (!email) {
        errors.push({ msg: 'Email is required!' });
    }

    if (!username) {
        errors.push({ msg: 'Username is required!' });
    }

    if (!password) {
        errors.push({ msg: 'Password is required!' });
    }

    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match!' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            username,
            password,
            password2,
            title: 'Register'
        });
    } else {
        User.findOne({ username })
            .then(user => {
                if (user) {
                    req.flash('danger', 'Username exists, choose another.');
                    res.redirect('/users/register');
                } else {
                    const user = new User({
                        name,
                        email,
                        username,
                        password,
                        admin: 0
                    });

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(user.password, salt, (err, hash) => {
                            if (err) console.log(err);

                            user.password = hash;
                            user.save()
                                .then(user => {
                                    req.flash('success', 'You are now registered!');
                                    res.redirect('/users/login');
                                })
                                .catch(err => {
                                    console.log(err);
                                    return;
                                });
                        });
                    });
                }
            });
    }
});

// GET LOGIN
router.get('/login', (req, res) => {
    if (res.locals.user) res.redirect('/');
    res.render('login', {
        title: 'Log in'
    });
});

// POST LOGIN
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// GET LOGOUT
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'You are logged out!');
    res.redirect('/users/login');
});








module.exports = router;