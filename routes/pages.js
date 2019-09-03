const express = require('express');
const router = express.Router();
const Page = require('../models/Page');

// GET /
router.get('/', (req, res) => {
    Page.findOne({ slug: 'home' })
        .then(page => {
            res.render('index', {
                title: page.title,
                content: page.content
            });
        });
});

// GET A PAGE
router.get('/:slug', (req, res) => {
    let slug = req.params.slug;

    Page.findOne({ slug })
        .then(page => {
            if (!page) {
                res.redirect('/');
            } else {
                res.render('index', {
                    title: page.title,
                    content: page.content
                });
            }
        });
});




module.exports = router;