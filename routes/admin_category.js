const express = require('express');
const router = express.Router();

const Category = require('../models/Category');
const { isUser, isAdmin } = require('../helpers/auth');

// GET CATEGORY INDEX
router.get('/', isAdmin, (req, res) => {
    Category.find({})
        .then(categories => {
            res.render('admin/categories', {
                categories
            });
        });
});

// GET ADD CATEGORY
router.get('/add-category', isAdmin, (req, res) => {
    let title = '';
    res.render('admin/add_category', {
        title
    });
});

// POST ADD CATEGORY
router.post('/add-category', (req, res) => {
    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();

    let errors = [];

    if (!title) {
        errors.push({ msg: 'Title must have a value' });
    }

    if (errors.length > 0) {
        res.render('admin/add_category', {
            errors,
            title
        });
    } else {
        Category.findOne({ slug })
            .then(category => {
                if (category) {
                    req.flash('danger', 'Category slug exists, choose another.');
                    res.render('admin/add_category', {
                        title
                    });
                } else {
                    const category = new Category({
                        title,
                        slug
                    });

                    category.save()
                        .then(category => {
                            Category.find({})
                                .then(categories => {
                                    req.app.locals.categories = categories;
                                })
                                .catch(err => console.log(err));
                            req.flash('success', 'Category Added!');
                            res.redirect('/admin/categories');
                        });
                }
            });
    }
});

// GET EDIT CATEGORY
router.get('/edit-category/:id', isAdmin, (req, res) => {
    Category.findOne({
        _id: req.params.id
    })
        .then(category => {
            res.render('admin/edit_category', {
                category
            });
        });
});

// POST EDIT CATEGORY
router.post('/edit-category/:id', (req, res) => {
    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    let id = req.params.id;

    let errors = [];

    if (!title) {
        errors.push({ msg: 'Title must have a value' });
    }

    if (errors.length > 0) {
        res.render('admin/edit_category', {
            errors,
            title,
            id
        });
    } else {
        Category.findOne({ slug: slug, _id: { '$ne': id } }, (err, category) => {
            if (category) {
                req.flash('danger', 'Category title exists, choose another.');
                res.render('admin/edit_category', {
                    title,
                    id
                });
            } else {
                Category.findById(id, (err, category) => {
                    if (err) {
                        return console.log(err);
                    }
                    category.title = title;
                    category.slug = slug;

                    category.save(err => {
                        if (err) {
                            return console.log(err);
                        }
                        Category.find({})
                            .then(categories => {
                                req.app.locals.categories = categories;
                            })
                            .catch(err => console.log(err));
                        req.flash('success', 'Categoty edited');
                        res.redirect('/admin/categories/edit-category/' + id);
                    });
                });
            }
        });
    }
});

// GET DELETE CATEGORY
router.get('/delete-category/:id', isAdmin, (req, res) => {
    Category.findByIdAndRemove(req.params.id, err => {
        if (err) {
            return console.log(err);
        }
        Category.find({})
            .then(categories => {
                req.app.locals.categories = categories;
            })
            .catch(err => console.log(err));
        req.flash('success', 'Category Deleted');
        res.redirect('/admin/categories');
    });
});










module.exports = router;