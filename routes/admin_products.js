const express = require('express');
const router = express.Router();
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');

const Product = require('../models/Product');
const Category = require('../models/Category');
const { isUser, isAdmin } = require('../helpers/auth');


// GET PRODUCTS INDEX
router.get('/', isAdmin, (req, res) => {
    let count;

    Product.countDocuments((err, c) => {
        count = c;
    });

    Product.find({})
        .then(products => {
            res.render('admin/products', {
                products,
                count
            });
        });
});

// GET ADD PRODUCT
router.get('/add-product', isAdmin, (req, res) => {
    let title = '';
    let description = '';
    let price = '';

    Category.find((err, categories) => {
        res.render('admin/add_product', {
            title,
            description,
            categories,
            price
        });
    });
});

// POST ADD PRODUCT
router.post('/add-product', (req, res) => {
    let imageFile = typeof req.files.image !== 'undefined' ? req.files.image.name : '';

    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    let description = req.body.description;
    let price = req.body.price;
    let category = req.body.category;

    let errors = [];

    if (!title) {
        errors.push({ msg: 'Title must have a value' });
    }

    if (!description) {
        errors.push({ msg: 'Description must have a value' });
    }

    if (!price) {
        errors.push({ msg: 'Price must have a value' });
    }

    if (errors.length > 0) {
        Category.find((err, categories) => {
            res.render('admin/add_product', {
                errors,
                title,
                description,
                price,
                categories
            });
        });
    } else {
        Product.findOne({ slug }, (err, product) => {
            if (product) {
                req.flash('danger', 'Product title exists, choose another.');
                Category.find((err, categories) => {
                    res.render('admin/add_product', {
                        title,
                        description,
                        categories,
                        price,
                    });
                });
            } else {
                let price2 = parseFloat(price).toFixed(2);

                const product = new Product({
                    title: title,
                    slug: slug,
                    description: description,
                    price: price2,
                    category: category,
                    image: imageFile
                });

                product.save((err) => {
                    if (err) {
                        return console.log(err);
                    }
                    mkdirp('public/product_images/' + product._id, err => {
                        return console.log(err);
                    });

                    mkdirp('public/product_images/' + product._id + '/gallery', err => {
                        return console.log(err);
                    });

                    mkdirp('public/product_images/' + product._id + '/gallery/thumbs', err => {
                        return console.log(err);
                    });

                    if (imageFile != '') {
                        let productImage = req.files.image;
                        let path = 'public/product_images/' + product._id + '/' + imageFile;

                        productImage.mv(path, err => {
                            return console.log(err);
                        });

                        req.flash('success', 'Product Added');
                        res.redirect('/admin/products');
                    }
                });
            }
        });
    }
});

// GET EDIT PRODUCT
router.get('/edit-product/:id', isAdmin, (req, res) => {
    let errors;

    if (req.session.errors) errors = req.session.errors;
    req.session.errors = null;

    Category.find((err, categories) => {
        Product.findById(req.params.id, (err, product) => {
            if (err) {
                console.log(err);
                res.redirect('/admin/products');
            } else {
                let galleryDir = 'public/product_images/' + product._id + '/gallery';
                let galleryImages = null;

                fs.readdir(galleryDir, (err, files) => {
                    if (err) {
                        console.log(err);
                    } else {
                        galleryImages = files;

                        res.render('admin/edit_product', {
                            title: product.title,
                            errors: errors,
                            description: product.description,
                            categories: categories,
                            category: product.category.replace(/\s+/g, '-').toLowerCase(),
                            price: parseFloat(product.price).toFixed(2),
                            image: product.image,
                            galleryImages: galleryImages,
                            id: product._id
                        });
                    }
                });
            }
        });
    });
});

// POST EDIT PRODUCT
router.post('/edit-product/:id', (req, res) => {
    let imageFile = typeof req.files.image !== 'undefined' ? req.files.image.name : '';

    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    let description = req.body.description;
    let price = req.body.price;
    let category = req.body.category;
    let pimage = req.body.pimage;
    let id = req.params.id;

    let errors = [];

    if (!title) {
        errors.push({ msg: 'Title must have a value' });
    }

    if (!description) {
        errors.push({ msg: 'Description must have a value' });
    }

    if (!price) {
        errors.push({ msg: 'Price must have a value' });
    }

    if (errors.length > 0) {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' + id);
    } else {
        Product.findOne({ slug, _id: { '$ne': id } }, (err, product) => {
            if (err) {
                return console.log(err);
            }
            if (product) {
                req.flash('danger', 'Product slug exists, choose another.');
                res.redirect('/admin/products/edit-product/' + id);
            } else {
                Product.findById(id, (err, product) => {
                    if (err) console.log(err);

                    product.title = title;
                    product.slug = slug;
                    product.description = description;
                    product.price = parseFloat(price).toFixed(2);
                    product.category = category;

                    if (imageFile != '') {
                        product.image = imageFile;
                    }

                    product.save(err => {
                        if (err) console.log(err);

                        if (imageFile != '') {
                            if (pimage != '') {
                                fs.remove('public/product_images/' + id + '/' + pimage, err => {
                                    if (err) console.log(err);
                                });
                            }
                            let productImage = req.files.image;
                            let path = 'public/product_images/' + id + '/' + imageFile;

                            productImage.mv(path, err => {
                                return console.log(err);
                            });
                        }
                        req.flash('success', 'Product edited');
                        res.redirect('/admin/products/edit-product/' + id);
                    });
                });
            }
        });
    }
});

// POST PRODUCT GALLERY
router.post('/product-gallery/:id', (req, res) => {
    let productImage = req.files.file;
    let id = req.params.id;
    let path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
    let thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

    productImage.mv(path, err => {
        if (err) console.log(err);

        resizeImg(fs.readFileSync(path), { width: 100, height: 100 })
            .then(buf => {
                fs.writeFileSync(thumbsPath, buf);
            });
    });

    res.sendStatus(200);
});

// GET DELETE GALLERY IMAGE
router.get('/delete-image/:image', isAdmin, (req, res) => {
    let originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    let thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, err => {
        if (err) {
            console.log(err);
        } else {
            fs.remove(thumbImage, err => {
                if (err) {
                    console.log(err);
                } else {
                    req.flash('success', 'Image deleted');
                    res.redirect('/admin/products/edit-product/' + req.query.id);
                }
            });
        }
    });
});

// GET DELETE PRODUCT
router.get('/delete-product/:id', isAdmin, (req, res) => {
    let id = req.params.id;
    let path = 'public/product_images/' + id;

    fs.remove(path, (err) => {
        if (err) {
            console.log(err)
        } else {
            Product.findByIdAndRemove(id, err => {
                if (err) {
                    return console.log(err);
                }
                req.flash('success', 'Product deleted');
                res.redirect('/admin/products');
            });
        }
    });
});








module.exports = router;