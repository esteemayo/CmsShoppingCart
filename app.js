const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const fileUpload = require('express-fileupload');
const methodOverride = require('method-override');
const dotenv = require('dotenv');


dotenv.config();

// REQUIRE ROUTES
const pages = require('./routes/pages');
const products = require('./routes/products');
const cart = require('./routes/cart');
const users = require('./routes/users');
const adminPages = require('./routes/admin_pages');
const adminCategories = require('./routes/admin_category');
const adminProduct = require('./routes/admin_products');

const app = express();

// CONNECT DATABASE
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true
})
    .then(() => console.log('MongoDB Connected.....'))
    .catch(err => console.log(err));

// VIEW ENGINE
app.set('view engine', 'ejs');

// PUBLIC FOLDER
app.use(express.static(path.join(__dirname, 'public')));

// SET GLOBAL ERRORS VARIABLE
// app.locals.errors = null;

// GET PAGE MODEL
const Page = require('./models/Page');

// GET ALL PAGES TO PASS TO HEADER.EJS
Page.find({})
    .sort({ sorting: 1 })
    .then(pages => {
        app.locals.pages = pages;
    })
    .catch(err => console.log(err));

// GET CATEGORY MODEL
const Category = require('./models/Category');

// GET ALL PAGES TO PASS TO HEADER.EJS
Category.find({})
    .then(categories => {
        app.locals.categories = categories;
    })
    .catch(err => console.log(err));

// EXPRESS FILEUPLOAD MIDDLEWARE
app.use(fileUpload());

// BODY-PARSER MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// EXPRESS SESSION MIDDLEWARE
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

// METHOD OVERRIDE MIDDLEWARE
app.use(methodOverride('_method'));

// EXPRESS-VALIDATOR MIDDLEWARE
// app.use(expressValidator({
//     errorFormatter: function (param, msg, value) {
//         let namespace = param.split('-')
//             , root = namespace.shift()
//             , formParam = root;

//         while (namespace.length) {
//             formParam += '[' + namespace.shift() + ']';
//         }
//         return {
//             param: formParam,
//             msg: msg,
//             value: value
//         };
//     }
// }));

// EXPRESS-MESSAGES MIDDLEWARE
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// PASSPORT MIDDLEWARE
app.use(passport.initialize());
app.use(passport.session());

// PASSPORT CONFIG
require('./config/passport')(passport);

app.use((req, res, next) => {
    res.locals.errors = req.errors;
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next();
});

app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProduct);
app.use('/products', products);
app.use('/cart', cart);
app.use('/users', users);
app.use('/', pages);

const PORT = 9090;

app.listen(PORT, () => console.log(`APP LISTENING ON PORT ${PORT}`));