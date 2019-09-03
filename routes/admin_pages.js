const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Page = require('../models/Page');
const { isUser, isAdmin } = require('../helpers/auth');


// PAGE INDEX
router.get('/', isAdmin, (req, res) => {
    Page.find({})
        .sort({ sorting: 1 })
        .then(pages => {
            res.render('admin/pages', {
                pages
            });
        });
});


// ADD PAGE
router.get('/add-page', isAdmin, (req, res) => {
    let title = "";
    let slug = "";
    let content = "";

    res.render('admin/add_page', {
        title,
        slug,
        content
    });
});

// POST ADD PAGE
// router.post('/add-page', [
//     check('title', 'Title must have a value.').not().isEmpty(),
//     check('content', 'Content must have a value.').not().isEmpty()
// ], (req, res) => {


//     let title = req.body.title;
//     let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
//     if (slug == '') slug = title.replace(/\s+/g, '-').toLowerCase();
//     let content = req.body.content;

//     let errors = validationResult(req);

//     if (errors) {
//         res.render('admin/add_page', {
//             errors: errors.array(),
//             title,
//             slug,
//             content
//         });
//     } else {
//         Page.findOne({ slug })
//             .then(page => {
//                 if (page) {
//                     req.flash('danger', 'Page slug exists, choose another.');
//                     res.render('admin/add-page', {
//                         title,
//                         slug,
//                         content
//                     });
//                 } else {
//                     const page = new Page({
//                         title,
//                         slug,
//                         content,
//                         sorting: 0
//                     });

//                     page.save()
//                         .then(page => {
//                             req.flash('success', 'Page Added!');
//                             res.redirect('/admin/pages');
//                         })
//                         .catch(err => {
//                             console.log(err);
//                             return;
//                         });
//                 }
//             });
//     }
// });

router.post('/add-page', (req, res) => {
    let title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == '') slug = title.replace(/\s+/g, '-').toLowerCase();
    let content = req.body.content;

    let errors = [];

    if (!title || !content) {
        errors.push({ msg: 'Please fill all the required fields' });
    }

    if (errors.length > 0) {
        res.render('admin/add_page', {
            errors,
            title,
            content
        });
    } else {
        Page.findOne({ slug })
            .then(page => {
                if (page) {
                    req.flash('danger', 'Page slug exists, choose another.');
                    res.render('admin/add_page', {
                        title,
                        slug,
                        content
                    });
                } else {
                    const page = new Page({
                        title,
                        slug,
                        content,
                        sorting: 100
                    });

                    page.save()
                        .then(page => {
                            Page.find({})
                                .sort({ sorting: 1 })
                                .then(pages => {
                                    req.app.locals.pages = pages;
                                });

                            req.flash('success', 'Page Added!');
                            res.redirect('/admin/pages');
                        })
                        .catch(err => {
                            console.log(err);
                            return;
                        });
                }
            });
    }
});

// SORT PAGES FUNCTION
function sortPages(ids, callback) {
    var count = 0;

    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;

        (function (count) {
            Page.findById(id, (err, page) => {
                page.sorting = count;
                page.save(err => {
                    if (err) {
                        return console.log(err);
                    }
                    ++count;
                    if (count >= ids.length) {
                        callback();
                    }
                });
            });
        })(count);
    }
}

// POST REORDER PAGES
router.post('/reorder-pages', (req, res) => {
    var ids = req.body['id'];

    sortPages(ids, () => {
        Page.find({})
            .sort({ sorting: 1 })
            .then(pages => {
                req.app.locals.pages = pages;
            });
    });
});

// GET EDIT PAGE
router.get('/edit-page/:id', isAdmin, (req, res) => {
    Page.findOne({
        _id: req.params.id
    })
        .then(page => {
            res.render('admin/edit_page', {
                title: page.title,
                slug: page.slug,
                content: page.content,
                id: page._id
            });
        })
        .catch(err => {
            return console.log(err)
        });
});



// POST EDIT PAGE
router.post('/edit-page/:id', (req, res) => {
    let title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == '') slug = title.replace(/\s+/g, '-').toLowerCase();
    let content = req.body.content;
    let id = req.params.id;

    let errors = [];

    if (!title || !content) {
        errors.push({ msg: 'Please all required fields must be filled!' });
    }

    if (errors.length > 0) {
        res.render('admin/edit_page', {
            errors,
            title,
            slug,
            content,
            id
        });
    } else {
        Page.findOne({ slug: slug, _id: { '$ne': id } }, (err, page) => {
            if (page) {
                req.flash('danger', 'Page slug exists, choose another.');
                res.render('admin/edit_page', {
                    title,
                    slug,
                    content,
                    id
                });
            } else {
                Page.findById(id, (err, page) => {
                    if (err) {
                        return console.log(err);
                    }
                    page.title = title;
                    page.slug = slug;
                    page.content = content;

                    page.save((err) => {
                        if (err) {
                            return console.log(err);
                        }
                        Page.find({})
                            .sort({ sorting: 1 })
                            .then(pages => {
                                req.app.locals.pages = pages;
                            });

                        req.flash('success', 'Page Edited!');
                        res.redirect('/admin/pages/edit-page/' + id);
                    });
                });
            }
        });
    }
});

// GET DELETE PAGE
router.get('/delete-page/:id', isAdmin, (req, res) => {
    Page.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            return console.log(err);
        }
        Page.find({})
            .sort({ sorting: 1 })
            .then(pages => {
                req.app.locals.pages = pages;
            });

        req.flash('success', 'Page Deleted!');
        res.redirect('/admin/pages');
    });
});


module.exports = router;