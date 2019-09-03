const express = require('express');
const router = express.Router();
const fs = require('fs-extra');

const Product = require('../models/Product');
const Category = require('../models/Category');
const { isUser, isAdmin } = require('../helpers/auth');

// GET ALL PRODUCTS
router.get('/', (req, res) => {
    Product.find({})
        .then(products => {
            res.render('all_products', {
                title: 'All products',
                products
            });
        });
});

// GET PRODUCT BY CATEGORY
router.get('/:category', (req, res) => {
    let categorySlug = req.params.category;

    Category.findOne({ slug: categorySlug })
        .then(category => {
            Product.find({ category: categorySlug })
                .then(products => {
                    res.render('category_products', {
                        title: category.title,
                        products
                    });
                });
        });
});

// GET PRODUCT DETAILS
router.get('/:category/:product', (req, res) => {
    let galleryImages = null;
    let loggedIn = (req.isAuthenticated()) ? true : false;

    Product.findOne({ slug: req.params.product }, (err, product) => {
        if (err) {
            console.log(err);
        } else {
            let galleryDir = 'public/product_images/';

            fs.readdir(galleryDir, (err, files) => {
                if (err) {
                    console.log(err);
                } else {
                    galleryImages = files;

                    res.render('product', {
                        title: product.title,
                        product: product,
                        galleryImages: galleryImages,
                        loggedIn: loggedIn
                    });
                }
            });
        }
    });
});






module.exports = router;