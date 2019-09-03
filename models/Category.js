const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String
    }
});

module.exports = mongoose.model('Category', CategorySchema);