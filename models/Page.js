const mongoose = require('mongoose');

const PageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    sorting: {
        type: Number
    }
});

module.exports = mongoose.model('Page', PageSchema);