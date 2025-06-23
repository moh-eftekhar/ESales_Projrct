const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    imageUrl: String,
    variants: [{ color: String, size: String }],
    inventory: { type: Number, default: 100 }
});

module.exports = mongoose.model('Product', ProductSchema);