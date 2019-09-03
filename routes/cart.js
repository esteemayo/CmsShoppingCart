const express = require('express');
const router = express.Router();

const Product = require('../models/Product');

// GET ADD PRODUCT TO CART
router.get('/add/:product', (req, res) => {
    let slug = req.params.product;

    Product.findOne({ slug })
        .then(product => {
            if (typeof req.session.cart == 'undefined') {
                req.session.cart = [];
                req.session.cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(product.price).toFixed(2),
                    image: '/product_images/' + product.id + '/' + product.image
                });
            } else {
                let cart = req.session.cart;
                let newItem = true;

                for (let i = 0; i < cart.length; i++) {
                    if (cart[i].title == slug) {
                        cart[i].qty++;
                        newItem = false;
                        break;
                    }
                }
                // CHECK IF NEW ITEM IS TRUE
                if (newItem) {
                    cart.push({
                        title: slug,
                        qty: 1,
                        price: parseFloat(product.price).toFixed(2),
                        image: '/product_images/' + product.id + '/' + product.image
                    });
                }
            }
            // console.log(req.session.cart);
            req.flash('success', 'Product Added');
            res.redirect('back');
        });
});

// GET CHECKOUT PAGE
router.get('/checkout', (req, res) => {
    if (req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect('/cart/checkout');
    } else {
        res.render('checkout', {
            title: 'Checkout',
            cart: req.session.cart
        });
    }
});

// GET UPDATE PRODUCT
router.get('/update/:product', (req, res) => {
    let slug = req.params.product;
    let cart = req.session.cart;
    let action = req.query.action;

    for (let i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
            switch (action) {
                case 'add':
                    cart[i].qty++;
                    break;
                case 'remove':
                    cart[i].qty--;
                    if (cart[i].qty < 1) cart.splice(i, 1);
                    break;
                case 'clear':
                    cart.splice(i, 1);
                    if (cart.length == 0) delete req.session.cart;
                    break;

                default:
                    console.log('Update problem');
                    break;
            }
            break;
        }
    }
    req.flash('success', 'Cart Updated!');
    res.redirect('back');
});

// GET CLEAR CART
router.get('/clear', (req, res) => {
    delete req.session.cart;

    req.flash('success', 'Cart Cleared!');
    res.redirect('back');
});

// GET BUY NOW 
router.get('/buynow', (req, res) => {
    delete req.session.cart;
    res.sendStatus(200);
});








module.exports = router;