const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const User = require('../models/User');

module.exports = passport => {
    passport.use(new LocalStrategy((username, password, done) => {
        // MATCH USER
        User.findOne({ username })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: 'Authentication Failed!' });
                }

                // MATCH PASSWORD
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) console.log(err);

                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Authentication Failed!' });
                    }
                });
            });
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
}