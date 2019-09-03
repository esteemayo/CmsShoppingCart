module.exports = {
    isUser: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('danger', 'Please log in.');
        res.redirect('/users/login');
    },

    isAdmin: (req, res, next) => {
        if (req.isAuthenticated() && res.locals.user.admin == 1) {
            return next();
        }
        req.flash('danger', 'Please log in as admin.');
        res.redirect('/users/login');
    }
}